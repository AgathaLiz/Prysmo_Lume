/**
 * Simulações de exemplo por tipo de lição.
 *
 * A tabela `simulacoes` ainda não tem o cenário de cada lição. Enquanto
 * isso, o app escolhe aqui um cenário guiado de acordo com o nome da
 * lição, para a prática combinar com o que foi ensinado (mensagem,
 * ligação, Uber, e-mail, câmera...) em vez de repetir sempre o mesmo.
 *
 * Quando o banco tiver uma simulação cadastrada para a lição, ela tem
 * prioridade e este arquivo não é usado.
 */

import { CENARIO_EXEMPLO } from "@/lib/licao-exemplo";
import type { CenarioSimulacao } from "@/lib/simulacao";

/** Salvar um contato. Também é o cenário padrão. */
export const CENARIO_CONTATO: CenarioSimulacao = CENARIO_EXEMPLO;

/** Enviar uma mensagem. */
export const CENARIO_MENSAGEM: CenarioSimulacao = {
  titulo: "Vamos enviar uma mensagem",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo Mensagens.",
      alvo: "app_mensagens",
      dica: "É o ícone azul com um balão de conversa.",
    },
    {
      instrucao: "Toque na conversa da Maria.",
      alvo: "conversa_maria",
      dica: "É a primeira conversa da lista.",
    },
    {
      instrucao: "Toque no campo de escrever a mensagem.",
      alvo: "campo_mensagem",
      dica: "Fica na parte de baixo da tela.",
    },
    {
      instrucao: "Escreva sua mensagem e toque em Enviar.",
      alvo: "botao_enviar_mensagem",
      dica: "O botão azul com a seta.",
    },
  ],
};

/** Fazer uma ligação. */
export const CENARIO_TELEFONE: CenarioSimulacao = {
  titulo: "Vamos fazer uma ligação",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo Telefone.",
      alvo: "app_telefone",
      dica: "É o ícone verde com um telefone.",
    },
    {
      instrucao: "Toque no contato da Maria.",
      alvo: "contato_maria",
      dica: "É o primeiro nome da lista.",
    },
    {
      instrucao: "Toque no botão verde para ligar.",
      alvo: "botao_ligar",
      dica: "É o círculo verde com o telefone.",
    },
  ],
};

/** Pedir um carro no Uber. */
export const CENARIO_UBER: CenarioSimulacao = {
  titulo: "Vamos pedir um carro",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo Uber.",
      alvo: "app_uber",
      dica: "É o ícone preto com um carro.",
    },
    {
      instrucao: "Toque no campo e escreva o destino.",
      alvo: "campo_destino",
      dica: "É a caixa branca no topo da tela.",
    },
    {
      instrucao: "Toque em Pedir carro.",
      alvo: "botao_pedir_uber",
      dica: "É o botão preto no fim da tela.",
    },
  ],
};

/** Tirar uma foto e ver como ela ficou. */
export const CENARIO_CAMERA: CenarioSimulacao = {
  titulo: "Vamos tirar uma foto",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo Câmera.",
      alvo: "app_camera",
      dica: "É o ícone cinza com o desenho de uma câmera.",
    },
    {
      instrucao: "Aponte para o que quer fotografar e toque no botão branco.",
      alvo: "botao_foto",
      dica: "É o círculo branco grande, no meio embaixo.",
    },
    {
      instrucao: "Toque na miniatura para ver a foto que você tirou.",
      alvo: "foto_galeria",
      dica: "É o quadradinho no canto esquerdo, embaixo.",
    },
  ],
};

/** Reconhecer um e-mail falso e pedir ajuda. */
export const CENARIO_EMAIL: CenarioSimulacao = {
  titulo: "Vamos cuidar de um e-mail suspeito",
  tela: "home",
  passos: [
    {
      instrucao: "Toque no aplicativo E-mail.",
      alvo: "app_email",
      dica: "É o ícone vermelho com um envelope.",
    },
    {
      instrucao: "Toque no e-mail do Banco Lume para ler.",
      alvo: "email_suspeito",
      dica: "Ele pede para clicar num link. Desconfie!",
    },
    {
      instrucao: "Não toque no link. Toque em Avisar um familiar.",
      alvo: "acao_avisar",
      dica: "É a última opção da lista.",
    },
  ],
};

/** Deixa o texto sem acento e minúsculo para comparar palavras-chave. */
function semAcento(texto?: string | null): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Escolhe o cenário pela palavra-chave do nome da lição.
 * Sem combinar com nada, cai no cenário de contato (o mais geral).
 */
export function cenarioParaLicao(nome?: string | null): CenarioSimulacao {
  const chave = semAcento(nome);

  if (/(mensag|conversa|chat|whats)/.test(chave)) return CENARIO_MENSAGEM;
  if (/(ligac|ligar|chamad|telefonar|discar)/.test(chave)) {
    return CENARIO_TELEFONE;
  }
  if (/(uber|carro|corrida|motorista|taxi|viagem)/.test(chave)) {
    return CENARIO_UBER;
  }
  if (/(camera|foto|fotograf|selfie|galeria|retrato|imagem)/.test(chave)) {
    return CENARIO_CAMERA;
  }
  if (/(mail|golpe|fraude|link|senha|banco|seguranca|suspeit)/.test(chave)) {
    return CENARIO_EMAIL;
  }
  return CENARIO_CONTATO;
}