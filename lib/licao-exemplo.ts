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
  titulo: "Adicionar um contato no celular",
  descricao:
    "Nesta lição você vai aprender a salvar o telefone de alguém importante. É mais fácil do que parece: a gente vê o caminho junto, um passo de cada vez.",
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
 * Simulação simplificada: quatro toques, sempre com a instrução escrita
 * em cima e o elemento certo brilhando na tela do celular de mentirinha.
 *
 * O caminho é o do mockup: abrir o aplicativo Telefone, digitar o número,
 * tocar no "+" para criar um contato novo e, por fim, preencher o nome
 * para salvar. O que importa entre `**` aparece em roxo na instrução.
 */
export const CENARIO_EXEMPLO: CenarioSimulacao = {
  titulo: "Vamos adicionar um contato",
  tela: "home",
  passos: [
    {
      instrucao:
        "Primeiro, toque no aplicativo **Telefone** (aquele de cor verde).",
      alvo: "app_telefone",
      dica: "É o ícone verde com um telefone desenhado.",
    },
    {
      instrucao:
        "Em seguida, digite o **número de telefone** da pessoa que você deseja adicionar.",
      alvo: "tecla_1",
      tela: "discador",
      dica: "É só tocar nos números, começando pelo 1.",
    },
    {
      instrucao:
        "Agora, clique no ícone **mais (+)** e em **Criar Novo Contato**.",
      alvo: "botao_criar_contato",
      tela: "discador",
      dica: "O + fica no canto de cima da tela.",
    },
    {
      instrucao:
        "Por último, clique no campo **Nome** e em seguida, no **botão azul** para salvar.",
      alvo: "campo_nome",
      tela: "novo_contato",
      dica: "É a primeira caixinha branca. Depois é só o botão azul, lá em cima.",
    },
  ],
};
