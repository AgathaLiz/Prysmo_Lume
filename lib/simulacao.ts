/**
 * Leitura do JSON da tabela `simulacoes` (coluna `passos`).
 *
 * Aceita os dois formatos:
 * - o objeto do exemplo: { "titulo": "...", "passos": [ ... ] }
 * - só a lista:         [ { "instrucao": "...", "alvo": "..." } ]
 *
 * Também descobre em qual "tela" do celular fica cada alvo, para o
 * simulador trocar de tela sozinho (home -> telefone -> ...).
 */

export type PassoSimulacao = {
  instrucao: string;
  alvo: string;
  dica?: string;
  /** Opcional: força a tela fictícia usada nesse passo. */
  tela?: string;
};

export type CenarioSimulacao = {
  titulo?: string;
  tela?: string;
  passos: PassoSimulacao[];
};

/** Telas fictícias disponíveis. */
export type TelaFicticia =
  | "home"
  | "telefone"
  | "contatos"
  | "novo_contato"
  | "uber"
  | "email";

export function telaDoAlvo(alvo: string): TelaFicticia | null {
  if (alvo.startsWith("app_")) return "home";

  // Salvar contato: lista de contatos -> formulário de novo contato.
  if (alvo === "botao_novo_contato") return "contatos";
  if (
    alvo === "campo_nome" ||
    alvo === "campo_telefone" ||
    alvo === "botao_salvar_contato"
  ) {
    return "novo_contato";
  }

  if (
    alvo.startsWith("contato_") ||
    alvo === "botao_ligar" ||
    alvo === "botao_desligar" ||
    alvo.startsWith("tecla_")
  ) {
    return "telefone";
  }

  if (
    alvo === "campo_destino" ||
    alvo === "botao_pedir_uber" ||
    alvo === "botao_confirmar_uber" ||
    alvo.startsWith("destino_")
  ) {
    return "uber";
  }

  if (alvo.startsWith("email_") || alvo.startsWith("acao_")) return "email";

  return null;
}

function textoOuNada(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.trim() !== "" ? valor : undefined;
}

/**
 * Transforma o jsonb em algo seguro. Qualquer coisa estranha vira null
 * (a lição simplesmente pula a etapa de simulação, sem quebrar).
 */
export function normalizarCenario(
  json: unknown,
  tituloPadrao?: string | null
): CenarioSimulacao | null {
  if (!json) return null;

  let listaDePassos: unknown = json;
  let titulo: string | undefined;
  let tela: string | undefined;

  if (typeof json === "object" && !Array.isArray(json)) {
    const objeto = json as Record<string, unknown>;
    listaDePassos = objeto.passos;
    titulo = textoOuNada(objeto.titulo);
    tela = textoOuNada(objeto.tela);
  }

  if (!Array.isArray(listaDePassos)) return null;

  const passos: PassoSimulacao[] = [];

  for (const item of listaDePassos) {
    if (typeof item !== "object" || item === null) continue;
    const passo = item as Record<string, unknown>;

    const instrucao = textoOuNada(passo.instrucao);
    const alvo = textoOuNada(passo.alvo);
    if (!instrucao || !alvo) continue;

    passos.push({
      instrucao,
      alvo,
      dica: textoOuNada(passo.dica),
      tela: textoOuNada(passo.tela),
    });
  }

  if (passos.length === 0) return null;

  return {
    titulo: titulo ?? tituloPadrao ?? undefined,
    tela,
    passos,
  };
}
