/**
 * Dados que aparecem na home, no desempenho, no perfil e na conta.
 *
 * Tudo vem das tabelas que o app já usa. Se alguma consulta falhar, a tela
 * continua com valores vazios em vez de quebrar.
 */

import { supabase } from "@/lib/supabase";

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
  diasAtivos: number;
  /** Datas no formato AAAA-MM-DD. */
  datasAtivas: string[];
  criadoEm: string | null;
  provedor: string;
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
  datasAtivas: [],
  criadoEm: null,
  provedor: "E-mail e senha",
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
  update_at: string | null;
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

    const [respostaPontuacao, respostaProgresso] = usuarioId
      ? await Promise.all([
          supabase
            .from("usuario_pontuacao")
            .select("xp_total, nivel_atual")
            .eq("usuario_id", usuarioId)
            .maybeSingle<PontuacaoBanco>(),
          supabase
            .from("progresso_licao")
            .select("concluida, pontuacao, update_at")
            .eq("usuario_id", usuarioId),
        ])
      : [null, null];

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

    const datasAtivas = Array.from(
      new Set(
        progresso
          .map((item) => item.update_at?.slice(0, 10))
          .filter((data): data is string => Boolean(data))
      )
    ).sort();

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
      datasAtivas,
      criadoEm: user.created_at ?? null,
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
