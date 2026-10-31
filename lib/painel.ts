/**
 * Dados que aparecem na home, no desempenho, no perfil e na conta.
 *
 * Tudo vem das tabelas que o app já usa. Se alguma consulta falhar, a tela
 * continua com valores vazios em vez de quebrar.
 *
 * Ofensiva: os dias estudados ficam em `atividade_diaria` (gravados pelo
 * servidor quando um resultado de lição é salvo) e a sequência é calculada
 * pela função `ofensiva_atual()` no Postgres, no fuso de Brasília.
 */

import { supabase } from "@/lib/supabase";

export type ConquistaPainel = {
  id: number;
  nome: string;
  descricao: string;
  conquistada: boolean;
  /** Quando a pessoa ganhou (ISO) ou null se ainda não ganhou. */
  conquistadaEm: string | null;
};

export type DadosPainel = {
  usuarioId: number | null;
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  xp: number;
  nivel: number;
  licoesConcluidas: number;
  acertos: number;
  /** Total de dias em que a pessoa estudou (não precisam ser seguidos). */
  diasAtivos: number;
  /** Dias seguidos estudando, contando até hoje ou ontem. */
  ofensiva: number;
  /** Datas no formato AAAA-MM-DD. */
  datasAtivas: string[];
  criadoEm: string | null;
  provedor: string;
  /** Todas as conquistas do catálogo, as ganhas primeiro. */
  conquistas: ConquistaPainel[];
};

const VAZIO: DadosPainel = {
  usuarioId: null,
  nome: "",
  email: "",
  telefone: "",
  nascimento: "",
  xp: 0,
  nivel: 1,
  licoesConcluidas: 0,
  acertos: 0,
  diasAtivos: 0,
  ofensiva: 0,
  datasAtivas: [],
  criadoEm: null,
  provedor: "E-mail e senha",
  conquistas: [],
};

type UsuarioBanco = {
  usuario_id: number;
  nome_completo: string | null;
  telefone: string | null;
  data_nascimento: string | null;
};

type PontuacaoBanco = {
  xp_total: number | null;
  nivel_atual: number | null;
};

type ProgressoBanco = {
  concluida: boolean | null;
  pontuacao: number | null;
};

type AtividadeBanco = {
  dia: string;
};

function provedorBonito(provedor: string | undefined): string {
  if (provedor === "google") return "Google";
  if (provedor === "facebook") return "Facebook";
  return "E-mail e senha";
}

export async function carregarPainel(): Promise<DadosPainel> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return VAZIO;

    const respostaUsuario = await supabase
      .from("usuario")
      .select("usuario_id, nome_completo, telefone, data_nascimento")
      .eq("auth_user_id", user.id)
      .maybeSingle<UsuarioBanco>();

    const usuario = respostaUsuario.data;
    const usuarioId = usuario?.usuario_id ?? null;

    const [
      respostaPontuacao,
      respostaProgresso,
      respostaAtividade,
      respostaOfensiva,
      respostaCatalogo,
      respostaGanhas,
    ] = usuarioId
      ? await Promise.all([
          supabase
            .from("usuario_pontuacao")
            .select("xp_total, nivel_atual")
            .eq("usuario_id", usuarioId)
            .maybeSingle<PontuacaoBanco>(),
          supabase
            .from("progresso_licao")
            .select("concluida, pontuacao")
            .eq("usuario_id", usuarioId),
          supabase
            .from("atividade_diaria")
            .select("dia")
            .eq("usuario_id", usuarioId)
            .order("dia", { ascending: false })
            .limit(400),
          supabase.rpc("ofensiva_atual"),
          supabase
            .from("conquistas")
            .select("conquistas_id, nome, descricao")
            .not("codigo", "is", null)
            .order("conquistas_id", { ascending: true }),
          supabase
            .from("usuario_conquista")
            .select("conquista_id, created_at")
            .eq("usuario_id", usuarioId),
        ])
      : [null, null, null, null, null, null];

    if (respostaAtividade?.error) {
      console.log("Erro ao ler os dias estudados:", respostaAtividade.error.message);
    }
    if (respostaOfensiva?.error) {
      console.log("Erro ao ler a ofensiva:", respostaOfensiva.error.message);
    }

    if (respostaCatalogo?.error) {
      console.log("Erro ao ler as conquistas:", respostaCatalogo.error.message);
    }

    const ganhas = new Map<number, string | null>();
    for (const linha of (respostaGanhas?.data ?? []) as {
      conquista_id: number;
      created_at: string | null;
    }[]) {
      ganhas.set(linha.conquista_id, linha.created_at);
    }

    const conquistas: ConquistaPainel[] = (
      (respostaCatalogo?.data ?? []) as {
        conquistas_id: number;
        nome: string;
        descricao: string;
      }[]
    )
      .map((item) => ({
        id: item.conquistas_id,
        nome: item.nome,
        descricao: item.descricao,
        conquistada: ganhas.has(item.conquistas_id),
        conquistadaEm: ganhas.get(item.conquistas_id) ?? null,
      }))
      .sort((a, b) => Number(b.conquistada) - Number(a.conquistada) || a.id - b.id);

    const pontuacao = respostaPontuacao?.data ?? null;
    const progresso = (respostaProgresso?.data ?? []) as ProgressoBanco[];

    const xp = pontuacao?.xp_total ?? 0;
    const licoesConcluidas = progresso.filter(
      (item) => item.concluida === true
    ).length;
    const notas = progresso
      .map((item) => item.pontuacao)
      .filter((nota): nota is number => typeof nota === "number");
    const acertos =
      notas.length > 0
        ? Math.round(notas.reduce((soma, nota) => soma + nota, 0) / notas.length)
        : 0;

    const datasAtivas = ((respostaAtividade?.data ?? []) as AtividadeBanco[])
      .map((linha) => linha.dia)
      .sort();

    const ofensiva =
      typeof respostaOfensiva?.data === "number" ? respostaOfensiva.data : 0;

    return {
      usuarioId: usuario?.usuario_id ?? null,
      nome: usuario?.nome_completo?.trim() ?? user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
      telefone: usuario?.telefone ?? "",
      nascimento: usuario?.data_nascimento ?? "",
      xp,
      nivel: pontuacao?.nivel_atual ?? Math.floor(xp / 50) + 1,
      licoesConcluidas,
      acertos,
      diasAtivos: datasAtivas.length,
      ofensiva,
      datasAtivas,
      criadoEm: user.created_at ?? null,
      conquistas,
      provedor: provedorBonito(
        user.app_metadata?.provider ?? user.identities?.[0]?.provider
      ),
    };
  } catch (erro) {
    console.log("Erro ao carregar painel:", erro);
    return VAZIO;
  }
}

export function formatarDataCurta(data: string | null): string {
  if (!data) return "";
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return data;
  return `${String(parsed.getDate()).padStart(2, "0")}/${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}/${parsed.getFullYear()}`;
}

export function formatarDataNascimento(data: string | null): string {
  if (!data) return "";
  // O banco pode devolver "AAAA-MM-DD" ou uma data ISO completa.
  const somenteData = data.slice(0, 10);
  const [ano, mes, dia] = somenteData.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

export function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}