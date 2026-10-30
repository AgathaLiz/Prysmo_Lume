import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONES = {
  inicio: require("../assets/images/icons/Icons=home.png") as ImageSourcePropType,
  progresso: require("../assets/images/icons/Icons=estatisticas.png") as ImageSourcePropType,
  perfil: require("../assets/images/icons/Icons=pefil_tab_bar.png") as ImageSourcePropType,
};

type Aba = "inicio" | "progresso" | "perfil";

function AbaAtiva({
  icone,
  ativo,
}: {
  icone: ImageSourcePropType;
  ativo: boolean;
}) {
  return (
    <View style={styles.centroIcone}>
      {ativo ? (
        <LinearGradient
          colors={["#FFD36E", "#F3A6B8", "#C77DFF"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.circuloAtivo}
        >
          <Image source={icone} style={styles.iconeAtivo} resizeMode="contain" />
        </LinearGradient>
      ) : (
        <Image source={icone} style={styles.iconeInativo} resizeMode="contain" />
      )}
    </View>
  );
}

/**
 * Barra inferior compartilhada pelas abas e pelas telas de configuração.
 * Nas telas de configuração o perfil continua marcado, como no design.
 */
export function BarraNavegacao() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const naHome = pathname.includes("tela_inicial");
  const noProgresso = pathname.includes("tela_opcoes");
  const ativo: Aba = naHome ? "inicio" : noProgresso ? "progresso" : "perfil";

  const irPara = (aba: Aba) => {
    if (aba === ativo) return;

    if (aba === "inicio") router.navigate("/pages/tela_inicial" as never);
    if (aba === "progresso") router.navigate("/pages/tela_opcoes" as never);
    if (aba === "perfil") router.navigate("/pages/tela_usuario" as never);
  };

  return (
    <View
      style={[
        styles.barra,
        { bottom: Math.max(insets.bottom, 12) },
      ]}
      accessibilityRole="tablist"
    >
      <TouchableOpacity
        style={styles.botao}
        onPress={() => irPara("inicio")}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: ativo === "inicio" }}
        accessibilityLabel="Início"
      >
        <AbaAtiva icone={ICONES.inicio} ativo={ativo === "inicio"} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => irPara("progresso")}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: ativo === "progresso" }}
        accessibilityLabel="Desempenho"
      >
        <AbaAtiva icone={ICONES.progresso} ativo={ativo === "progresso"} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => irPara("perfil")}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: ativo === "perfil" }}
        accessibilityLabel="Perfil"
      >
        <AbaAtiva icone={ICONES.perfil} ativo={ativo === "perfil"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    position: "absolute",
    left: 18,
    right: 18,
    height: 92,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3ED",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#1A0524",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 12,
  },
  botao: {
    flex: 1,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  centroIcone: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  circuloAtivo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 9,
    elevation: 6,
  },
  iconeAtivo: {
    width: 42,
    height: 42,
  },
  iconeInativo: {
    width: 40,
    height: 40,
    opacity: 0.72,
  },
});
