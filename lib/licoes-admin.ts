import { normalizarCenario } from "@/lib/simulacao";
import { supabase } from "@/lib/supabase";

/**
 * CRUD das lições para a administração.
 *
 * No banco, a lição que a pessoa vê é uma linha de `aulas` (`nome` é o título
 * que aparece na lista — `aulas_conteudo.titulo` é o conteúdo, não o nome), e o
 * conteúdo (`aulas_conteudo`), as perguntas (`questoes`/`alternativas`) e a
 * prática (`simulacoes`) penduram nela. Mesmo formato do resto do app: erro
 * vira `null` ou `{ ok: false, erro }`, com a mensagem no console.
 */

export type LicaoAdmin = {
  id: number;
  nome: string | null;
};

export type ResultadoLicao = {
  ok: boolean;
  id?: number;
  erro?: string;
};

export type QuestaoAdmin = {
  id: number;
  pergunta: string;
  alternativas: string[];
};

export type DetalhesLicao = {
  id: number;
  /** Nome que aparece na lista; vazio vira "*Lição sem Título*". */
  nome: string;
  titulo: string;
  subtitulo: string;
  /** Os passos que a pessoa vai fazer, como na introdução da lição. */
  passos: string[];
  questoes: QuestaoAdmin[];
  /** As instruções da prática (simulação). */
  praticas: string[];
};

type ConteudoBanco = {
  titulo: string | null;
  descricao: string | null;
};

type AulaBanco = {
  aulas_id: number;
  nome: string | null;
  aulas_conteudo?: ConteudoBanco | ConteudoBanco[] | null;
};

type AlternativaBanco = {
  alternativas_id: number;
  texto: string | null;
};

type QuestaoBanco = {
  questoes_id: number;
  pergunta: string | null;
  alternativas?: AlternativaBanco | AlternativaBanco[] | null;
};

/** O banco pode devolver a lista ligada como objeto ou como lista de um. */
function comoLista<T>(valor: T | T[] | null | undefined): T[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

/** Como o app chama a lição que ainda não tem nome. */
export function nomeDaLicao(nome: string | null | undefined): string {
  return nome?.trim() || "*Lição sem Título*";
}

/** Monta os passos da introdução (os mesmos que a lição mostra para a pessoa). */
function montarPassos(temQuestoes: boolean): string[] {
  const lista = ["Assistir a um vídeo"];
  if (temQuestoes) lista.push("Responder algumas perguntas");
  lista.push("Praticar no celular de mentirinha");
  return lista;
}

/** Todas as lições do app, na ordem de criação. */
export async function listarLicoes(): Promise<LicaoAdmin[] | null> {
  try {
    const { data, error } = await supabase
      .from("aulas")
      .select("aulas_id, nome")
      .order("aulas_id", { ascending: true });

    if (error) {
      console.log("Erro ao ler as lições:", error.message);
      return null;
    }

    return ((data ?? []) as AulaBanco[]).map((aula) => ({
      id: aula.aulas_id,
      nome: aula.nome,
    }));
  } catch (erro) {
    console.log("Erro ao ler as lições:", erro);
    return null;
  }
}

/** Cria uma lição nova (sem título, como no mockup) dentro de uma unidade. */
export async function criarLicao(
  nivelId: number,
  nome: string | null = null
): Promise<ResultadoLicao> {
  try {
    const { data, error } = await supabase
      .from("aulas")
      .insert({ nome, niveis_id: nivelId })
      .select("aulas_id")
      .maybeSingle<{ aulas_id: number }>();

    if (error || !data) {
      console.log("Erro ao criar a lição:", error?.message);
      return { ok: false, erro: error?.message ?? "Não deu para criar a lição." };
    }

    return { ok: true, id: data.aulas_id };
  } catch (erro) {
    console.log("Erro ao criar a lição:", erro);
    return { ok: false, erro: "Não deu para criar a lição agora." };
  }
}

/** Troca o nome (o título da lista) de uma lição. */
export async function renomearLicao(
  aulasId: number,
  nome: string
): Promise<ResultadoLicao> {
  try {
    const { error } = await supabase
      .from("aulas")
      .update({ nome: nome.trim() || null })
      .eq("aulas_id", aulasId);

    if (error) {
      console.log("Erro ao salvar o nome da lição:", error.message);
      return { ok: false, erro: error.message };
    }

    return { ok: true, id: aulasId };
  } catch (erro) {
    console.log("Erro ao salvar o nome da lição:", erro);
    return { ok: false, erro: "Não deu para salvar o nome agora." };
  }
}

/** Atualiza o título e o subtítulo da lição (`aulas_conteudo`). */
export async function atualizarConteudoLicao(
  aulasId: number,
  conteudo: { titulo: string; subtitulo: string }
): Promise<ResultadoLicao> {
  try {
    const { error } = await supabase
      .from("aulas_conteudo")
      .update({ titulo: conteudo.titulo, descricao: conteudo.subtitulo })
      .eq("aulas_id", aulasId);

    if (error) {
      console.log("Erro ao salvar o conteúdo da lição:", error.message);
      return { ok: false, erro: error.message };
    }

    return { ok: true, id: aulasId };
  } catch (erro) {
    console.log("Erro ao salvar o conteúdo da lição:", erro);
    return { ok: false, erro: "Não deu para salvar o conteúdo agora." };
  }
}

/** Apaga uma lição. */
export async function removerLicao(aulasId: number): Promise<ResultadoLicao> {
  try {
    const { error } = await supabase.from("aulas").delete().eq("aulas_id", aulasId);

    if (error) {
      console.log("Erro ao apagar a lição:", error.message);
      return { ok: false, erro: error.message };
    }

    return { ok: true };
  } catch (erro) {
    console.log("Erro ao apagar a lição:", erro);
    return { ok: false, erro: "Não deu para apagar a lição agora." };
  }
}

/** Tudo o que a tela "Informações da lição" mostra. */
export async function carregarDetalhesLicao(
  aulasId: number
): Promise<DetalhesLicao | null> {
  try {
    const respostaAula = await supabase
      .from("aulas")
      .select("aulas_id, nome, aulas_conteudo(titulo, descricao)")
      .eq("aulas_id", aulasId)
      .maybeSingle<AulaBanco>();

    if (respostaAula.error || !respostaAula.data) {
      console.log("Erro ao ler a lição:", respostaAula.error?.message);
      return null;
    }

    const aula = respostaAula.data;
    const conteudo = comoLista(aula.aulas_conteudo)[0] ?? null;

    const respostaLicao = await supabase
      .from("licoes")
      .select("licoes_id")
      .eq("aulas_id", aulasId)
      .maybeSingle<{ licoes_id: number }>();

    const licoesId = respostaLicao.data?.licoes_id ?? null;

    let questoes: QuestaoAdmin[] = [];
    let praticas: string[] = [];

    if (licoesId !== null) {
      const respostaQuestoes = await supabase
        .from("questoes")
        .select("questoes_id, pergunta, alternativas(alternativas_id, texto)")
        .eq("licoes_id", licoesId)
        .order("questoes_id", { ascending: true });

      if (respostaQuestoes.error) {
        console.log("Erro ao ler as perguntas:", respostaQuestoes.error.message);
      } else {
        questoes = ((respostaQuestoes.data ?? []) as QuestaoBanco[])
          .map((questao) => ({
            id: questao.questoes_id,
            pergunta: questao.pergunta?.trim() || "Pergunta sem enunciado",
            alternativas: comoLista(questao.alternativas)
              .sort((a, b) => a.alternativas_id - b.alternativas_id)
              .map((alternativa) => alternativa.texto?.trim() || "")
              .filter((texto) => texto.length > 0),
          }))
          .filter((questao) => questao.alternativas.length > 0);
      }

      const respostaSimulacao = await supabase
        .from("simulacoes")
        .select("tipo, passos")
        .eq("licoes_id", licoesId)
        .limit(1)
        .maybeSingle<{ tipo: string | null; passos: unknown }>();

      if (respostaSimulacao.error) {
        console.log("Prática indisponível:", respostaSimulacao.error.message);
      } else if (respostaSimulacao.data) {
        const cenario = normalizarCenario(
          respostaSimulacao.data.passos,
          respostaSimulacao.data.tipo
        );
        praticas = cenario?.passos.map((passo) => passo.instrucao) ?? [];
      }
    }

    return {
      id: aula.aulas_id,
      nome: nomeDaLicao(aula.nome),
      titulo: conteudo?.titulo?.trim() || nomeDaLicao(aula.nome),
      subtitulo: conteudo?.descricao?.trim() || "",
      passos: montarPassos(questoes.length > 0),
      questoes,
      praticas,
    };
  } catch (erro) {
    console.log("Erro ao ler a lição:", erro);
    return null;
  }
}
