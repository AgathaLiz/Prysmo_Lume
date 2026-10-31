/**
 * Salvamento do resultado da lição.
 *
 * Quem grava progresso, XP e desbloqueios é o SERVIDOR (função
 * `salvar_resultado_licao` no Postgres). O app só envia o id da lição e a
 * nota. As tabelas usuario_pontuacao e desbloqueio são somente leitura
 * para o cliente, então gravar direto por aqui não funciona mais.
 *
 * Regras aplicadas pelo servidor:
 * - guarda sempre a MELHOR nota (nota baixa não apaga nota boa);
 * - nunca desfaz um concluida = true que já existia;
 * - soma XP só na primeira aprovação;
 * - se era a última lição do nível, libera o próximo nível.
 */

import { supabase } from "@/lib/supabase";

export type ResultadoParaSalvar = {
  /** licoes_id (bigint no banco). */
  licaoId: number;
  /** Mantidos por compatibilidade com a tela; o servidor não usa. */
  notaQuestionario: number | null;
  notaSimulacao: number | null;
  /** Vira a coluna `progresso_licao.pontuacao`. */
  notaFinal: number;
  /** O servidor recalcula a aprovação pela nota. */
  aprovado: boolean;
  /** O servidor descobre sozinho qual nível liberar. */
  proximoNivelId: number | null;
};

export type ResultadoSalvo =
  | { ok: true; xpGanho: number; jaEstavaConcluida: boolean }
  | { ok: false; mensagem: string };

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
    const { data, error } = await supabase.rpc("salvar_resultado_licao", {
      p_licao_id: resultado.licaoId,
      p_nota: resultado.notaFinal,
    });

    if (error || !data || data.length === 0) {
      console.log("Erro ao salvar o resultado:", error?.message);
      return {
        ok: false,
        mensagem: "Não foi possível salvar seu resultado. Tente de novo.",
      };
    }

    const linha = data[0] as {
      xp_ganho: number;
      ja_estava_concluida: boolean;
    };

    return {
      ok: true,
      xpGanho: linha.xp_ganho,
      jaEstavaConcluida: linha.ja_estava_concluida,
    };
  } catch (erro) {
    // Rede caiu, JSON estranho, etc. Nunca derruba a tela.
    console.log("Erro ao salvar progresso:", erro);
    return {
      ok: false,
      mensagem: "Parece que a internet falhou. Vamos tentar de novo?",
    };
  }
}