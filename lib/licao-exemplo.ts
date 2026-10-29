/**
 * Primeira lição de exemplo: salvar um contato no celular.
 *
 * Enquanto o banco ainda não tem o conteúdo desta lição, a tela usa este
 * conteúdo local. Assim a pessoa já consegue fazer a lição inteira
 * (vídeo, perguntas e simulação) sem depender de novas tabelas ou seeds.
 *
 * Quando o conteúdo for cadastrado no Supabase, ele tem prioridade e este
 * arquivo deixa de ser usado sozinho.
 */

import type { CenarioSimulacao } from "@/lib/simulacao";

export type AlternativaExemplo = {
  texto: string;
  correta: boolean;
};

export type QuestaoExemplo = {
  pergunta: string;
  alternativas: AlternativaExemplo[];
};

export const CONTEUDO_EXEMPLO = {
  titulo: "Salvar um contato no celular",
  descricao:
    "Nesta lição você vai aprender a guardar o telefone de alguém importante. É mais fácil do que parece: a gente vê o caminho junto, um passo de cada vez.",
  // Ainda não temos o vídeo: o tipo "video" faz a tela reservar o espaço.
  url_arquivo: null,
  tipo: "video",
} as const;

export const QUESTOES_EXEMPLO: QuestaoExemplo[] = [
  {
    pergunta: "Onde o telefone de uma pessoa fica guardado no celular?",
    alternativas: [
      { texto: "No aplicativo Contatos", correta: true },
      { texto: "Na galeria de fotos", correta: false },
      { texto: "No calendário", correta: false },
    ],
  },
  {
    pergunta: "Depois de escrever o nome e o telefone, o que você toca?",
    alternativas: [
      { texto: "Em Salvar", correta: true },
      { texto: "Em Apagar", correta: false },
      { texto: "Em Voltar sem salvar", correta: false },
    ],
  },
];

/**
 * Simulação simplificada: cinco toques, sempre com a instrução escrita
 * em cima e o elemento certo brilhando na tela do celular de mentirinha.
 */
export const CENARIO_EXEMPLO: CenarioSimulacao = {
  titulo: "Vamos salvar um contato",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo Contatos.",
      alvo: "app_contatos",
      dica: "É o ícone roxo com uma pessoa desenhada.",
    },
    {
      instrucao: "Toque em Novo contato.",
      alvo: "botao_novo_contato",
      dica: "Fica no topo da lista de contatos.",
    },
    {
      instrucao: "Toque no campo Nome.",
      alvo: "campo_nome",
      dica: "É a primeira caixa branca da tela.",
    },
    {
      instrucao: "Agora toque no campo Telefone.",
      alvo: "campo_telefone",
      dica: "Fica logo abaixo do nome.",
    },
    {
      instrucao: "Por fim, toque em Salvar.",
      alvo: "botao_salvar_contato",
      dica: "É o botão roxo no fim da tela.",
    },
  ],
};
