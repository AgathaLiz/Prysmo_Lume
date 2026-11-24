import { supabase } from "@/lib/supabase";

/**
 * CRUD das unidades (no banco, a tabela `niveis`: cada nível é uma unidade /
 * trilha). Segue o mesmo formato do resto do app: erro vira `null` (ou
 * `{ ok: false, erro }`) e a mensagem original vai para o console.
 *
 * Obs.: as colunas `dificuldade` e `posicao` podem ainda não existir no banco.
 * Quando isso acontece, as leituras/gravações caem para o que já existe
 * (`nome`) em vez de quebrar a tela.
 */

export type LicaoResumo = {
  id: number;
  nome: string;
};

export type Unidade = {
  id: number;
  nome: string;
  dificuldade: string | null;
  posicao: number | null;
  licoes: LicaoResumo[];
};

export type DadosUnidade = {
  nome: string;
  dificuldade: string | null;
  posicao: number | null;
  numeroLicoes: number | null;
  licoesIds: number[];
};

export type ResultadoUnidade = {
  ok: boolean;
  id?: number;
  erro?: string;
};

type AulaLigada = {
  aulas_id: number;
  nome: string | null;
};

type NivelBanco = {
  niveis_id: number;
  nome: string | null;
  dificuldade?: string | null;
  posicao?: number | null;
  aulas?: AulaLigada | AulaLigada[] | null;
};

const COLUNAS_COMPLETAS = "niveis_id, nome, dificuldade, posicao, aulas(aulas_id, nome)";
const COLUNAS_BASICAS = "niveis_id, nome, aulas(aulas_id, nome)";

/** O banco pode devolver a lista ligada como objeto ou como lista de um. */
function comoLista<T>(valor: T | T[] | null | undefined): T[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function nomeDaLicao(aula: AulaLigada): string {
  return aula.nome?.trim() || "*Lição sem Título*";
}

/** Todas as unidades, na ordem de criação, com as lições que estão em cada uma. */
export async function listarUnidades(): Promise<Unidade[] | null> {
  try {
    const completa = await supabase
      .from("niveis")
      .select(COLUNAS_COMPLETAS)
      .order("niveis_id", { ascending: true });

    let linhas: unknown = completa.data;

    if (completa.error) {
      console.log("Leitura simples das unidades:", completa.error.message);

      const basica = await supabase
        .from("niveis")
        .select(COLUNAS_BASICAS)
        .order("niveis_id", { ascending: true });

      if (basica.error) {
        console.log("Erro ao ler as unidades:", basica.error.message);
        return null;
      }

      linhas = basica.data;
    }

    return ((linhas ?? []) as NivelBanco[]).map((nivel) => ({
      id: nivel.niveis_id,
      nome: nivel.nome?.trim() || `Unidade #${nivel.niveis_id}`,
      dificuldade: nivel.dificuldade ?? null,
      posicao: nivel.posicao ?? null,
      licoes: comoLista(nivel.aulas)
        .sort((a, b) => a.aulas_id - b.aulas_id)
        .map((aula) => ({ id: aula.aulas_id, nome: nomeDaLicao(aula) })),
    }));
  } catch (erro) {
    console.log("Erro ao ler as unidades:", erro);
    return null;
  }
}

/** Uma unidade só, com as lições dela. */
export async function carregarUnidade(nivelId: number): Promise<Unidade | null> {
  const unidades = await listarUnidades();
  return unidades?.find((unidade) => unidade.id === nivelId) ?? null;
}

/** Põe (ou tira) as lições escolhidas na unidade, pelo `aulas.niveis_id`. */
async function definirLicoesDaUnidade(
  nivelId: number,
  licoesIds: number[]
): Promise<string | null> {
  if (licoesIds.length === 0) return null;

  const { error } = await supabase
    .from("aulas")
    .update({ niveis_id: nivelId })
    .in("aulas_id", licoesIds);

  if (error) {
    console.log("Erro ao ligar as lições na unidade:", error.message);
    return error.message;
  }

  return null;
}

/** Busca um `passos_guiados_id` válido para satisfazer a coluna NOT NULL de `niveis`. */
async function obterPassosGuiadosId(): Promise<number | null> {
  const deNiveis = await supabase
    .from("niveis")
    .select("passos_guiados_id")
    .not("passos_guiados_id", "is", null)
    .limit(1)
    .maybeSingle<{ passos_guiados_id: number }>();

  if (!deNiveis.error && typeof deNiveis.data?.passos_guiados_id === "number") {
    return deNiveis.data.passos_guiados_id;
  }

  const deTabela = await supabase
    .from("passos_guiados")
    .select("passos_guiados_id")
    .limit(1)
    .maybeSingle<{ passos_guiados_id: number }>();

  if (!deTabela.error && typeof deTabela.data?.passos_guiados_id === "number") {
    return deTabela.data.passos_guiados_id;
  }

  return null;
}

/** Cria uma unidade (e liga as lições escolhidas nela). */
export async function criarUnidade(dados: DadosUnidade): Promise<ResultadoUnidade> {
  try {
    const passosGuiadosId = await obterPassosGuiadosId();
    const base: Record<string, unknown> = { nome: dados.nome };
    if (passosGuiadosId !== null) {
      base.passos_guiados_id = passosGuiadosId;
    }

    const completo = {
      ...base,
      dificuldade: dados.dificuldade,
      posicao: dados.posicao,
      numero_licoes: dados.numeroLicoes,
    };

    const tentativaCompleta = await supabase
      .from("niveis")
      .insert(completo)
      .select("niveis_id")
      .maybeSingle<{ niveis_id: number }>();

    let idCriado = tentativaCompleta.data?.niveis_id ?? null;
    let erro = tentativaCompleta.error?.message ?? null;

    if (erro) {
      console.log("Gravando a unidade só com o nome:", erro);

      const tentativaSimples = await supabase
        .from("niveis")
        .insert(base)
        .select("niveis_id")
        .maybeSingle<{ niveis_id: number }>();

      idCriado = tentativaSimples.data?.niveis_id ?? null;
      erro = tentativaSimples.error?.message ?? null;
    }

    if (erro || idCriado === null) {
      return { ok: false, erro: erro ?? "Não deu para criar a unidade." };
    }

    const erroLicoes = await definirLicoesDaUnidade(idCriado, dados.licoesIds);

    return { ok: true, id: idCriado, erro: erroLicoes ?? undefined };
  } catch (erro) {
    console.log("Erro ao criar a unidade:", erro);
    return { ok: false, erro: "Não deu para criar a unidade agora." };
  }
}

/** Atualiza uma unidade existente (e as lições ligadas a ela). */
export async function atualizarUnidade(
  nivelId: number,
  dados: DadosUnidade
): Promise<ResultadoUnidade> {
  try {
    const completo = {
      nome: dados.nome,
      dificuldade: dados.dificuldade,
      posicao: dados.posicao,
      numero_licoes: dados.numeroLicoes,
    };

    const tentativaCompleta = await supabase
      .from("niveis")
      .update(completo)
      .eq("niveis_id", nivelId);

    let erro = tentativaCompleta.error?.message ?? null;

    if (erro) {
      console.log("Atualizando a unidade só com o nome:", erro);

      const tentativaSimples = await supabase
        .from("niveis")
        .update({ nome: dados.nome })
        .eq("niveis_id", nivelId);

      erro = tentativaSimples.error?.message ?? null;
    }

    if (erro) return { ok: false, erro };

    const erroLicoes = await definirLicoesDaUnidade(nivelId, dados.licoesIds);

    return { ok: true, id: nivelId, erro: erroLicoes ?? undefined };
  } catch (erro) {
    console.log("Erro ao atualizar a unidade:", erro);
    return { ok: false, erro: "Não deu para salvar a unidade agora." };
  }
}

/** Remove dependências de uma lista de aulas quando não é possível apenas desvincular. */
async function removerAulasEmCascata(aulasIds: number[]): Promise<string | null> {
  if (aulasIds.length === 0) return null;

  const { data: licoes } = await supabase
    .from("licoes")
    .select("licoes_id")
    .in("aulas_id", aulasIds);

  const licoesIds = ((licoes ?? []) as { licoes_id: number }[]).map((l) => l.licoes_id);

  if (licoesIds.length > 0) {
    await supabase.from("progresso_licao").delete().in("licoes_id", licoesIds);
    await supabase.from("simulacoes").delete().in("licoes_id", licoesIds);

    const { data: questoes } = await supabase
      .from("questoes")
      .select("questoes_id")
      .in("licoes_id", licoesIds);

    const questoesIds = ((questoes ?? []) as { questoes_id: number }[]).map(
      (q) => q.questoes_id
    );

    if (questoesIds.length > 0) {
      await supabase.from("alternativas").delete().in("questoes_id", questoesIds);
      await supabase.from("questoes").delete().in("licoes_id", licoesIds);
    }

    await supabase.from("licoes").delete().in("licoes_id", licoesIds);
  }

  await supabase.from("aulas_conteudo").delete().in("aulas_id", aulasIds);

  const { error } = await supabase.from("aulas").delete().in("aulas_id", aulasIds);
  return error?.message ?? null;
}

/** Apaga uma unidade (desvinculando, movendo ou removendo antes as aulas ligadas a ela). */
export async function removerUnidade(nivelId: number): Promise<ResultadoUnidade> {
  try {
    const { data: aulasDaUnidade, error: erroBuscaAulas } = await supabase
      .from("aulas")
      .select("aulas_id")
      .eq("niveis_id", nivelId);

    if (erroBuscaAulas) {
      console.log("Erro ao buscar aulas da unidade:", erroBuscaAulas.message);
      return { ok: false, erro: erroBuscaAulas.message };
    }

    const aulasIds = ((aulasDaUnidade ?? []) as { aulas_id: number }[]).map(
      (a) => a.aulas_id
    );

    if (aulasIds.length > 0) {
      // 1. Tenta desvincular as aulas (niveis_id = null).
      const desvincular = await supabase
        .from("aulas")
        .update({ niveis_id: null })
        .eq("niveis_id", nivelId);

      if (desvincular.error) {
        // 2. Se niveis_id for NOT NULL, tenta mover as aulas para outra unidade existente.
        const { data: outraUnidade } = await supabase
          .from("niveis")
          .select("niveis_id")
          .neq("niveis_id", nivelId)
          .order("niveis_id", { ascending: true })
          .limit(1)
          .maybeSingle<{ niveis_id: number }>();

        if (outraUnidade?.niveis_id) {
          const mover = await supabase
            .from("aulas")
            .update({ niveis_id: outraUnidade.niveis_id })
            .eq("niveis_id", nivelId);

          if (mover.error) {
            console.log("Erro ao mover aulas da unidade:", mover.error.message);
            return { ok: false, erro: mover.error.message };
          }
        } else {
          // 3. Se não existe outra unidade, remove as aulas e suas dependências em cascata.
          const erroCascata = await removerAulasEmCascata(aulasIds);
          if (erroCascata) {
            console.log("Erro ao apagar aulas da unidade:", erroCascata);
            return { ok: false, erro: erroCascata };
          }
        }
      }
    }

    const { error } = await supabase
      .from("niveis")
      .delete()
      .eq("niveis_id", nivelId);

    if (error) {
      console.log("Erro ao apagar a unidade:", error.message);
      return { ok: false, erro: error.message };
    }

    return { ok: true };
  } catch (erro) {
    console.log("Erro ao apagar a unidade:", erro);
    return { ok: false, erro: "Não deu para apagar a unidade agora." };
  }
}
