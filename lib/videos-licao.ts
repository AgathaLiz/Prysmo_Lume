/**
 * Vídeos de cada lição, guardados dentro do app (assets/videos).
 * A chave é a posição da lição na trilha (1 = primeira).
 *
 * 1ª lição: salvar contato      2ª lição: WhatsApp
 * 3ª lição: tirar foto          4ª lição: mensagens perigosas
 */
const VIDEOS_POR_POSICAO: Record<number, number> = {
  1: require("../assets/videos/tutorial-contato.mp4"),
  2: require("../assets/videos/whatsApp.mp4"),
  3: require("../assets/videos/foto.mp4"),
  4: require("../assets/videos/menPerigosa.mp4"),
};

/** Devolve o vídeo local da lição (aceito direto pelo expo-video), ou null. */
export function videoDaLicao(posicao: number | null | undefined): number | null {
  if (!posicao) return null;
  return VIDEOS_POR_POSICAO[posicao] ?? null;
}
