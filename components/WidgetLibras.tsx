import * as WebBrowser from "expo-web-browser";
import { Hand } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const VLIBRAS_APP_URL = "https://vlibras.gov.br/app";
const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";

/**
 * Integração oficial com o VLibras (API/Plugin do Governo Federal).
 * - Na Web: carrega o widget oficial do VLibras na página quando Libras está ativo.
 * - No Mobile: exibe o botão flutuante que abre o tradutor oficial do governo.
 */
export function WidgetLibras() {
  const { libras, fonte } = useAcessibilidade();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const containerExistente = document.getElementById("lume-vlibras-root");

    if (!libras) {
      if (containerExistente) containerExistente.style.display = "none";
      return;
    }

    if (containerExistente) {
      containerExistente.style.display = "block";
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "lume-vlibras-root";
    wrapper.setAttribute("vw", "");
    wrapper.className = "enabled";
    wrapper.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>
    `;
    document.body.appendChild(wrapper);

    const iniciar = () => {
      try {
        const w = window as unknown as {
          VLibras?: { Widget?: new (url: string) => void };
        };
        if (w.VLibras?.Widget) {
          new w.VLibras.Widget(VLIBRAS_APP_URL);
        }
      } catch {
        // Ignora se o script externo falhar sem internet.
      }
    };

    const scriptExistente = document.getElementById("vlibras-plugin-script");
    if (scriptExistente) {
      iniciar();
      return;
    }

    const script = document.createElement("script");
    script.id = "vlibras-plugin-script";
    script.src = VLIBRAS_SCRIPT_URL;
    script.async = true;
    script.onload = iniciar;
    document.body.appendChild(script);
  }, [libras]);

  if (!libras) return null;

  const abrirVLibras = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const botao = document.querySelector(
        "#lume-vlibras-root [vw-access-button]"
      ) as HTMLElement | null;
      if (botao) {
        botao.click();
        return;
      }
    }
    void WebBrowser.openBrowserAsync(VLIBRAS_APP_URL);
  };

  return (
    <Pressable
      onPress={abrirVLibras}
      style={({ pressed }) => [
        styles.botao,
        { top: insets.top + 64, opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Abrir tradutor oficial de Libras do Governo (VLibras)"
    >
      <Hand size={18} color="#FFFFFF" strokeWidth={2.4} />
      <Text style={[styles.texto, { fontSize: fonte(12) }]}>VLibras</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    position: "absolute",
    right: 14,
    zIndex: 900,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0052CC",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  texto: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#FFFFFF",
  },
});
