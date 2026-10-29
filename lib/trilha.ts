/**
 * Monta a trilha de lições a partir dos dados do Supabase.
 *
 * Regra central: o estado "bloqueada" NUNCA é guardado no banco.
 * Ele é calculado aqui, em ordem: niveis.ordem -> aulas.ordem -> id.
 * (As colunas `ordem` ainda não existem; até existirem, vale a ordem de
 * criação, ou seja, o id.)
 * A primeira lição do app é sempre "atual" e cada lição só abre quando a
 * anterior está concluida = true. Existe no máximo UMA lição "atual".
 *
 * Obs.: no banco, licoes.aulas_id é UNIQUE, então cada aula tem no máximo
 * uma lição. O título do nó vem de aulas.nome (aulas_conteudo.titulo é o
 * conteúdo da aula, não o nome da lição).
 */

import { NOTA_MINIMA_PADRAO, estrelasDaNota } from "@/lib/nota";

export type EstadoLicao = "concluida" | "atual" | "bloqueada";

/**
 * Linha da tabela `licoes` (bigint -> number no app).
 * `nota_minima` e `ordem` ainda não existem no banco: ficam opcionais e o
 * código cai no padrão (70) e na ordem por id. Quando a coluna for criada,
 * basta selecioná-la na tela.
 */
export type LicaoBanco = {
  licoes_id: number;
  aulas_id: number;
  nota_minima?: number | null;
  ordem?: number | null;
};

/** Linha da tabela `aulas` com as lições aninhadas. */
export type AulaBanco = {
  aulas_id: number;
  niveis_id: number;
  nome: string;
  ordem?: number | null;
  /**
   * O PostgREST devolve objeto (não lista) quando a relação é 1:1.
   * Como `licoes.aulas_id` é UNIQUE, hoje vem um objeto só.
   */
  licoes: LicaoBanco[] | LicaoBanco | null;
};

/** Linha da tabela `niveis` com as aulas aninhadas. */
export type NivelBanco = {
  niveis_id: number;
  nome: string;
  ordem?: number | null;
  aulas: AulaBanco[] | null;
};

/** Só os campos de progresso que a trilha precisa. */
export type ProgressoBanco = {
  licoes_id: number;
  concluida: boolean | null;
  /** Usada só para saber se a pessoa já tentou a lição ("Continuar"). */
  pontuacao?: number | null;
};

export type LicaoTrilha = LicaoBanco & {
  estado: EstadoLicao;
  /** Posição na trilha inteira, começando em 1. */
  posicao: number;
  /** Nome pronto para exibir (nome da aula, ou "Lição 3" como reserva). */
  titulo: string;
  /** Nota mínima já resolvida (padrão 70 quando nula). */
  notaMinima: number;
  /** Já abriu essa lição antes (para mostrar "Continuar"). */
  jaTentou: boolean;
  /** Melhor nota já salva (null quando nunca fez). */
  pontuacao: number | null;
  /** Estrelas já conquistadas nesta lição (0 a 3). */
  estrelas: number;
};

export type NivelTrilha = {
  niveis_id: number;
  nome: string;
  ordem: number | null;
  /** Lições de todas as aulas do nível, já em ordem e achatadas para a lista. */
  licoes: LicaoTrilha[];
  total: number;
  concluidas: number;
  /** Ex.: "Você fez 3 de 8 lições" */
  resumo: string;
};

// Ordena por "ordem" quando a coluna existir; senão, pela ordem de criação (id).
function ordenarPor<T extends { ordem?: number | null }>(
  lista: T[],
  idDe: (item: T) => number
): T[] {
  return [...lista].sort((a, b) => {
    const ordemA = a.ordem ?? idDe(a);
    const ordemB = b.ordem ?? idDe(b);
    return ordemA - ordemB;
  });
}

/**
 * Aceita lista, objeto único ou nulo.
 * O Supabase devolve objeto nas relações 1:1 (é o caso de aulas -> licoes,
 * porque licoes.aulas_id é UNIQUE).
 */
export function comoLista<T>(valor: T[] | T | null | undefined): T[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

export function montarTrilha(
  niveis: NivelBanco[] | null | undefined,
  progresso: ProgressoBanco[] | null | undefined
): NivelTrilha[] {
  const listaNiveis = ordenarPor(niveis ?? [], (n) => n.niveis_id);

  // Só conta como concluída a lição que o banco marcou como concluida.
  const idsConcluidos = new Set(
    (progresso ?? [])
      .filter((p) => p.concluida === true)
      .map((p) => p.licoes_id)
  );

  // Qualquer linha de progresso significa que a pessoa já abriu a lição.
  const idsTentados = new Set((progresso ?? []).map((p) => p.licoes_id));

  // Melhor nota de cada lição (se houver mais de uma linha, vale a última).
  const pontuacaoPorLicao = new Map<number, number | null>();
  for (const item of progresso ?? []) {
    pontuacaoPorLicao.set(item.licoes_id, item.pontuacao ?? null);
  }

  // "A próxima pode abrir" começa liberado: a primeira lição do app é sempre atual.
  let podeAbrirProxima = true;
  let posicao = 0;

  return listaNiveis.map((nivel) => {
    const aulas = ordenarPor(comoLista(nivel.aulas), (a) => a.aulas_id);

    const licoes: LicaoTrilha[] = [];

    for (const aula of aulas) {
      const licoesDaAula = ordenarPor(comoLista(aula.licoes), (l) => l.licoes_id);
      const nomeDaAula = aula.nome?.trim() ?? "";

      for (const licao of licoesDaAula) {
        posicao += 1;

        let estado: EstadoLicao;
        if (idsConcluidos.has(licao.licoes_id)) {
          estado = "concluida";
        } else if (podeAbrirProxima) {
          estado = "atual";
        } else {
          estado = "bloqueada";
        }

        // Depois da primeira lição não concluída, nada mais abre.
        // (O "&& podeAbrirProxima" evita abrir buraco se o banco tiver progresso fora de ordem.)
        podeAbrirProxima = podeAbrirProxima && estado === "concluida";

        const pontuacao = pontuacaoPorLicao.get(licao.licoes_id) ?? null;
        const estrelas =
          estado === "concluida"
            ? estrelasDaNota(pontuacao ?? NOTA_MINIMA_PADRAO)
            : 0;

        licoes.push({
          ...licao,
          estado,
          posicao,
          titulo: nomeDaAula || `Lição ${posicao}`,
          notaMinima: licao.nota_minima ?? NOTA_MINIMA_PADRAO,
          jaTentou: idsTentados.has(licao.licoes_id),
          pontuacao,
          estrelas,
        });
      }
    }

    const concluidas = licoes.filter((l) => l.estado === "concluida").length;
    const total = licoes.length;

    return {
      niveis_id: nivel.niveis_id,
      nome: nivel.nome,
      ordem: nivel.ordem ?? null,
      licoes,
      total,
      concluidas,
      resumo: montarResumo(concluidas, total),
    };
  });
}

function montarResumo(concluidas: number, total: number): string {
  if (total === 0) return "Nenhuma lição por aqui ainda";
  if (concluidas === total) return "Você terminou todas as lições deste nível!";
  if (concluidas === 0) {
    return total === 1 ? "É 1 lição. Vamos começar?" : `São ${total} lições. Vamos começar?`;
  }
  return `Você fez ${concluidas} de ${total} lições`;
}

/** A lição que o usuário deve fazer agora (ou null se terminou tudo). */
export function licaoAtual(trilha: NivelTrilha[]): LicaoTrilha | null {
  for (const nivel of trilha) {
    const atual = nivel.licoes.find((l) => l.estado === "atual");
    if (atual) return atual;
  }
  return null;
}

/** Quantas lições existem e quantas já foram feitas, no app inteiro. */
export function resumoGeral(trilha: NivelTrilha[]): {
  total: number;
  concluidas: number;
  terminou: boolean;
} {
  const total = trilha.reduce((soma, nivel) => soma + nivel.total, 0);
  const concluidas = trilha.reduce((soma, nivel) => soma + nivel.concluidas, 0);
  return { total, concluidas, terminou: total > 0 && concluidas === total };
}
