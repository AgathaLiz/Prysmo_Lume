import { useWindowDimensions } from "react-native";

/** Tamanho de referência dos mockups do onboarding (iPhone 12/13). */
const LARGURA_MOCKUP = 390;
const ALTURA_MOCKUP = 844;

/** Prende um valor entre um mínimo e um máximo. */
export function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(Math.max(valor, minimo), maximo);
}

/**
 * Medidas responsivas das telas de onboarding.
 *
 * Os mockups foram desenhados em 390x844. Antes cada tela repetia números
 * fixos (por exemplo `marginTop: 450`), o que estourava a altura visível em
 * celulares mais baixos — justamente quando o navegador mostra a barra de
 * endereço — e deixava o botão de avançar fora da tela, sem rolagem.
 *
 * Agora cada tela pede a medida já ajustada:
 * - `fonte(tamanho)` acompanha a largura (não deixa o texto minúsculo em
 *   telas largas nem estoura em telas estreitas);
 * - `espaco(tamanho)` acompanha a altura (respiros verticais proporcionais);
 * - `quadrado(tamanho)` é para botões redondos e nunca passa do mockup.
 */
export function useEscalaOnboarding() {
  const { width, height } = useWindowDimensions();

  const fonte = (tamanho: number) =>
    Math.round(tamanho * limitar(width / LARGURA_MOCKUP, 0.82, 1.15));

  const espaco = (tamanho: number) =>
    Math.round(tamanho * limitar(height / ALTURA_MOCKUP, 0.6, 1.1));

  const quadrado = (tamanho: number) =>
    Math.round(tamanho * limitar(width / LARGURA_MOCKUP, 0.8, 1));

  return { largura: width, altura: height, fonte, espaco, quadrado };
}
