/**
 * Cálculo de notas da lição. Tudo aqui é função pura:
 * a tela só chama e mostra o resultado.
 */

/** Quanto cada etapa vale na nota final. */
export const PESOS_NOTA = {
  questionario: 0.5,
  simulacao: 0.5,
} as const;

export const NOTA_MINIMA_PADRAO = 70;

/** Cada erro na simulação desconta isso da nota (100, 75, 50, 25, 0...). */
export const DESCONTO_POR_ERRO = 25;

/** XP ganho na primeira vez que a lição é aprovada. */
export const XP_POR_LICAO = 20;

function limitarNota(valor: number): number {
  if (!Number.isFinite(valor)) return 0;
  return Math.min(100, Math.max(0, Math.round(valor)));
}

/** Nota do questionário = porcentagem de acertos. */
export function notaDoQuestionario(acertos: number, total: number): number {
  if (!total || total <= 0) return 0;
  return limitarNota((acertos / total) * 100);
}

/** Nota da simulação = 100 menos o desconto por erro, nunca abaixo de 0. */
export function notaDaSimulacao(
  erros: number,
  descontoPorErro: number = DESCONTO_POR_ERRO
): number {
  const totalDeErros = Math.max(0, erros);
  return limitarNota(100 - totalDeErros * descontoPorErro);
}

type EntradaNotaFinal = {
  /** null quando a lição não tem questionário. */
  questionario: number | null;
  /** null quando a lição não tem simulação. */
  simulacao: number | null;
};

/**
 * Junta as notas das etapas que existem.
 * Se a lição só tem uma etapa, ela vale 100% (não faz sentido perder metade
 * da nota por uma etapa que nem existe).
 */
export function notaFinal({ questionario, simulacao }: EntradaNotaFinal): number {
  const temQuestionario = questionario !== null;
  const temSimulacao = simulacao !== null;

  if (!temQuestionario && !temSimulacao) return 100;

  if (temQuestionario && temSimulacao) {
    const pesoTotal = PESOS_NOTA.questionario + PESOS_NOTA.simulacao;
    const soma =
      (questionario ?? 0) * PESOS_NOTA.questionario +
      (simulacao ?? 0) * PESOS_NOTA.simulacao;
    return limitarNota(soma / pesoTotal);
  }

  return limitarNota(questionario ?? simulacao ?? 0);
}

export function foiAprovado(
  nota: number,
  notaMinima: number = NOTA_MINIMA_PADRAO
): boolean {
  return nota >= (notaMinima ?? NOTA_MINIMA_PADRAO);
}

/** Guarda sempre a maior nota já feita (nota baixa não apaga nota boa). */
export function melhorNota(
  atual: number | null | undefined,
  nova: number
): number {
  if (atual === null || atual === undefined) return limitarNota(nova);
  return Math.max(limitarNota(atual), limitarNota(nova));
}

/** Texto curto e amigável para o resultado. */
export function descreverNota(nota: number): string {
  if (nota >= 100) return "Perfeito! Você acertou tudo.";
  if (nota >= 80) return "Muito bem! Você foi ótimo(a).";
  if (nota >= 60) return "Bom trabalho! Está quase lá.";
  return "Você está aprendendo. O importante é tentar.";
}

/** Quantas estrelas a lição pode dar. */
export const ESTRELAS_MAXIMAS = 3;

/** Nota necessária para ganhar as 3 estrelas. */
export const NOTA_TRES_ESTRELAS = 90;

/**
 * Converte a nota em estrelas de desempenho.
 *
 * A pessoa nunca fica sem nenhuma estrela: mesmo errando, o esforço conta.
 * - 3 estrelas: acertou quase tudo (90% ou mais);
 * - 2 estrelas: passou de fase (70% ou mais);
 * - 1 estrela: ainda não passou, mas já tentou.
 */
export function estrelasDaNota(nota: number): number {
  const valor = limitarNota(nota);
  if (valor >= NOTA_TRES_ESTRELAS) return 3;
  if (valor >= NOTA_MINIMA_PADRAO) return 2;
  return 1;
}

/** Frase amigável para acompanhar as estrelas. */
export function descreverEstrelas(estrelas: number): string {
  if (estrelas >= 3) return "Três estrelas! Você arrasou!";
  if (estrelas === 2) return "Duas estrelas! Você passou de fase!";
  return "Uma estrela! Você já começou. Tente de novo para ganhar mais.";
}

/** Passar de fase exige pelo menos 2 estrelas (nota 70). */
export function passouDeFase(estrelas: number): boolean {
  return estrelas >= 2;
}
