import { createVideoPlayer, type VideoPlayer } from "expo-video";
import { Image, Platform } from "react-native";

export type TipoSom = "acerto" | "erro" | "passou";

const FONTES: Record<TipoSom, number> = {
  acerto: require("../assets/audio/acertou-alternativa.mpeg"),
  erro: require("../assets/audio/errou-alternativa.mpeg"),
  passou: require("../assets/audio/passou-de-licao.mpeg"),
};

const players: Partial<Record<TipoSom, VideoPlayer>> = {};

function resolverUriWeb(modulo: unknown): string | null {
  if (typeof modulo === "string" && modulo.length > 0) return modulo;
  if (modulo && typeof modulo === "object") {
    const obj = modulo as { uri?: unknown; default?: unknown };
    if (typeof obj.uri === "string" && obj.uri.length > 0) return obj.uri;
    if (typeof obj.default === "string" && obj.default.length > 0) return obj.default;
  }
  try {
    const resolvido = Image.resolveAssetSource(modulo as number);
    return resolvido?.uri ?? null;
  } catch {
    return null;
  }
}

function tocarNaWeb(modulo: unknown): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  try {
    const uri = resolverUriWeb(modulo);
    if (!uri) return false;
    const audio = new window.Audio(uri);
    audio.volume = 0.9;
    void audio.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/**
 * Toca o efeito sonoro correspondente ("acerto", "erro" ou "passou").
 * Falhas de reprodução nunca travam a lição.
 */
export function tocarSom(tipo: TipoSom): void {
  try {
    if (tocarNaWeb(FONTES[tipo])) return;

    let player = players[tipo];
    if (!player) {
      player = createVideoPlayer(FONTES[tipo]);
      player.loop = false;
      players[tipo] = player;
    }
    player.currentTime = 0;
    player.play();
  } catch {
    // Sem bloqueio se o dispositivo não conseguir reproduzir o áudio.
  }
}
