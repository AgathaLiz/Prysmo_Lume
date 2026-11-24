import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

const CHAVE_FOTO = "lume_foto_perfil_v1";

/** Lê a foto de perfil salva localmente ou nos metadados da conta. */
export async function obterFotoPerfil(): Promise<string | null> {
  try {
    const local = await AsyncStorage.getItem(CHAVE_FOTO);
    if (local) return local;

    const { data } = await supabase.auth.getSession();
    const url = data.session?.user?.user_metadata?.avatar_url;
    return typeof url === "string" && url.length > 0 ? url : null;
  } catch {
    return null;
  }
}

/** Salva a foto de perfil localmente e tenta sincronizar com o perfil do usuário. */
export async function salvarFotoPerfil(uri: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_FOTO, uri);
    await supabase.auth.updateUser({ data: { avatar_url: uri } }).catch(() => {});
  } catch {
    // Sem bloqueio se offline.
  }
}

/**
 * Abre o seletor de imagem do dispositivo na Web (redimensionando para 256px
 * para ficar leve) e retorna a imagem pronta para exibir, ou `null` se cancelar.
 */
export function selecionarFotoDispositivo(): Promise<string | null> {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    let resolvido = false;
    const finalizar = (valor: string | null) => {
      if (resolvido) return;
      resolvido = true;
      resolve(valor);
    };

    input.onchange = () => {
      const arquivo = input.files?.[0];
      if (!arquivo) {
        finalizar(null);
        return;
      }

      const leitor = new FileReader();
      leitor.onload = () => {
        const resultado = typeof leitor.result === "string" ? leitor.result : null;
        if (!resultado) {
          finalizar(null);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          const max = 256;
          const escala = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * escala));
          canvas.height = Math.max(1, Math.round(img.height * escala));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            finalizar(canvas.toDataURL("image/jpeg", 0.82));
          } else {
            finalizar(resultado);
          }
        };
        img.onerror = () => finalizar(resultado);
        img.src = resultado;
      };
      leitor.onerror = () => finalizar(null);
      leitor.readAsDataURL(arquivo);
    };

    input.oncancel = () => finalizar(null);
    input.click();
  });
}
