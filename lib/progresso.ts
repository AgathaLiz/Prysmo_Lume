/**
 * Salvamento do resultado da lição.
 *
 * Esta é a única parte que conversa com o banco de progresso. A tela chama
 * `salvarResultadoLicao` e, se um dia isso virar uma função no Postgres,
 * basta trocar o corpo daqui para `supabase.rpc("salvar_resultado_licao", ...)`.
 *
 * Regras:
 * - guarda sempre a MELHOR nota (nota baixa não apaga nota boa);
 * - nunca desfaz um concluida = true que já existia;
 * - soma XP só na primeira aprovação;
 * - se era a última lição do nível, libera o próximo nível.
 *
 * Detalhe do schema atual: progresso_licao e desbloqueio ainda NÃO têm
 * UNIQUE (usuario_id, licoes_id/niveis_id), então não dá para usar
 * `upsert(onConflict)`. Fazemos "procura -> atualiza ou insere" na mão.
 * Quando a UNIQUE existir, o upsert pode substituir esse trecho.
 */

import { XP_POR_LICAO, melhorNota } from "@/lib/nota";
import { supabase } from "@/lib/supabase";

export type ResultadoParaSalvar = {
  /** licoes_id (bigint no banco). */
  licaoId: number;
  /**
   * Notas por etapa. Ainda não são gravadas porque as colunas
   * nota_quiz/nota_simulacao não existem; servem para a migração futura.
   */
  notaQuestionario: number | null;
  notaSimulacao: number | null;
  /** Vira a coluna `progresso_licao.pontuacao`. */
  notaFinal: number;
  aprovado: boolean;
  /** Preenchido só quando era a última lição do nível. */
  proximoNivelId: number | null;
};

export type ResultadoSalvo =
  | { ok: true; xpGanho: number; jaEstavaConcluida: boolean }
  | { ok: false; mensagem: string };

type LinhaProgresso = {
  progresso_licao_id: number;
  concluida: boolean | null;
  pontuacao: number | null;
};

/** usuario_id do app (não é o id do auth). Sempre vem da sessão atual. */
export async function obterUsuarioId(): Promise<number | null> {
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth.user) return null;

  const { data, error: erroUsuario } = await supabase
    .from("usuario")
    .select("usuario_id")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle<{ usuario_id: number }>();

  if (erroUsuario || !data) return null;
  return data.usuario_id;
}

export async function salvarResultadoLicao(
  resultado: ResultadoParaSalvar
): Promise<ResultadoSalvo> {
  try {
    const usuarioId = await obterUsuarioId();
    if (!usuarioId) {
      return { ok: false, mensagem: "Não encontramos sua conta. Entre novamente." };
    }

    // 1. Lê o que já foi feito nessa lição.
    const { data: anterior, error: erroLeitura } = await supabase
      .from("progresso_licao")
      .select("progresso_licao_id, concluida, pontuacao")
      .eq("usuario_id", usuarioId)
      .eq("licoes_id", resultado.licaoId)
      .order("progresso_licao_id", { ascending: false })
      .limit(1)
      .maybeSingle<LinhaProgresso>();

    if (erroLeitura) {
      return {
        ok: false,
        mensagem: "Não foi possível carregar seu progresso. Tente de novo.",
      };
    }

    const jaEstavaConcluida = anterior?.concluida === true;
    // Uma vez concluída, sempre concluída.
    const concluida = jaEstavaConcluida || resultado.aprovado;
    const pontuacao = melhorNota(anterior?.pontuacao, resultado.notaFinal);

    // 2. Grava mantendo a melhor nota.
    const { error: erroSalvar } = anterior
      ? await supabase
          .from("progresso_licao")
          .update({
            concluida,
            pontuacao,
            update_at: new Date().toISOString(),
          })
          .eq("progresso_licao_id", anterior.progresso_licao_id)
      : await supabase.from("progresso_licao").insert({
          usuario_id: usuarioId,
          licoes_id: resultado.licaoId,
          concluida,
          pontuacao,
          update_at: new Date().toISOString(),
        });

    if (erroSalvar) {
      return {
        ok: false,
        mensagem: "Não foi possível salvar seu resultado. Tente de novo.",
      };
    }

    // 3. XP só na primeira aprovação.
    let xpGanho = 0;
    if (!jaEstavaConcluida && resultado.aprovado) {
      xpGanho = await somarXp(usuarioId);
    }

    // 4. Última lição do nível aprovada -> libera o próximo nível.
    if (resultado.aprovado && resultado.proximoNivelId) {
      const erroDesbloqueio = await liberarNivel(
        usuarioId,
        resultado.proximoNivelId
      );

      // Não trava o salvamento por causa do desbloqueio; só registra.
      if (erroDesbloqueio) {
        console.log("Erro ao liberar próximo nível:", erroDesbloqueio);
      }
    }

    return { ok: true, xpGanho, jaEstavaConcluida };
  } catch (erro) {
    // Rede caiu, JSON estranho, etc. Nunca derruba a tela.
    console.log("Erro ao salvar progresso:", erro);
    return {
      ok: false,
      mensagem: "Parece que a internet falhou. Vamos tentar de novo?",
    };
  }
}

/** Soma XP em usuario_pontuacao.xp_total. Se ainda não existe linha, cria. */
async function somarXp(usuarioId: number): Promise<number> {
  const { data: pontuacao, error } = await supabase
    .from("usuario_pontuacao")
    .select("xp_total")
    .eq("usuario_id", usuarioId)
    .maybeSingle<{ xp_total: number | null }>();

  if (error) {
    console.log("Erro ao ler XP:", error.message);
    return 0;
  }

  if (!pontuacao) {
    const { error: erroInsert } = await supabase
      .from("usuario_pontuacao")
      .insert({
        usuario_id: usuarioId,
        xp_total: XP_POR_LICAO,
        nivel_atual: 1,
      });

    if (erroInsert) {
      console.log("Erro ao criar pontuação:", erroInsert.message);
      return 0;
    }
    return XP_POR_LICAO;
  }

  const { error: erroUpdate } = await supabase
    .from("usuario_pontuacao")
    .update({ xp_total: (pontuacao.xp_total ?? 0) + XP_POR_LICAO })
    .eq("usuario_id", usuarioId);

  if (erroUpdate) {
    console.log("Erro ao somar XP:", erroUpdate.message);
    return 0;
  }

  return XP_POR_LICAO;
}

/**
 * Marca o nível como liberado. Retorna a mensagem de erro, se houver.
 * `desbloqueado` é NOT NULL no banco, por isso sempre vai como true.
 */
async function liberarNivel(
  usuarioId: number,
  niveisId: number
): Promise<string | null> {
  const { data: existente, error: erroLeitura } = await supabase
    .from("desbloqueio")
    .select("desbloqueio_id")
    .eq("usuario_id", usuarioId)
    .eq("niveis_id", niveisId)
    .limit(1)
    .maybeSingle<{ desbloqueio_id: number }>();

  if (erroLeitura) return erroLeitura.message;

  if (existente) {
    const { error } = await supabase
      .from("desbloqueio")
      .update({ desbloqueado: true })
      .eq("desbloqueio_id", existente.desbloqueio_id);
    return error?.message ?? null;
  }

  const { error } = await supabase.from("desbloqueio").insert({
    usuario_id: usuarioId,
    niveis_id: niveisId,
    desbloqueado: true,
  });
  return error?.message ?? null;
}
