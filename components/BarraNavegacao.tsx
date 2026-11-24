import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONES = {
  inicio: require("../assets/images/icons/Icons=home.png") as ImageSourcePropType,
  progresso: require("../assets/images/icons/Icons=estatisticas.png") as ImageSourcePropType,
  perfil: require("../assets/images/icons/Icons=pefil_tab_bar.png") as ImageSourcePropType,
};

/** Cores do círculo do item aceso na barra (o mesmo degradê em toda a barra). */
const GRADIENTE_ACESO = ["#FFD36E", "#F3A6B8", "#C77DFF"] as const;

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
          colors={GRADIENTE_ACESO}
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

const CAMINHOS: Record<Aba, string> = {
  inicio: "/pages/tela_inicial",
  progresso: "/pages/tela_opcoes",
  perfil: "/pages/tela_usuario",
};

type BarraNavegacaoProps = {
  /**
   * Qual aba fica destacada. Por padrão é a aberta na tela atual
   * (nas telas de configuração o perfil continua marcado, como no design);
   * a trilha passa `inicio`, como no mockup.
   */
  aba?: Aba;
};

/**
 * Barra inferior compartilhada pelas abas, pelas telas de configuração
 * e pela trilha — sempre o mesmo componente/tamanhos, mudando só a aba
 * destacada.
 */
export function BarraNavegacao({ aba }: BarraNavegacaoProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const naHome = pathname.includes("tela_inicial");
  const noProgresso = pathname.includes("tela_opcoes");
  const automatica: Aba = naHome ? "inicio" : noProgresso ? "progresso" : "perfil";
  const ativo: Aba = aba ?? automatica;

  const irPara = (destino: Aba) => {
    // Pular só quando a rota atual já é dessa aba (por pathname, não por
    // aba destacada: da trilha, Início continua clicável).
    if (pathname.includes(CAMINHOS[destino])) return;
    router.navigate(CAMINHOS[destino] as never);
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

type BarraAdministradorProps = {
  /** O que acontece ao tocar no "+" (criar/gerenciar lições). */
  onAdicionar: () => void;
  /**
   * Qual item está aceso (com o círculo de degradê), como na barra do aluno: o
   * Início (padrão) ou o "+". Nas telas de lições/unidades quem está aceso é o
   * "+", igual ao mockup.
   */
  ativo?: "inicio" | "adicionar";
};

const ROTAS_ADICIONAR = [
  "/admin/unidades",
  "/admin/licoes",
  "/admin/licao-info",
  "/admin/criar-unidade",
  "/admin/gerenciar-unidades",
  "/admin/editar-unidade",
  "/admin/licao",
];

/**
 * Barra inferior do administrador, como no mockup: o Início e o "+". Funciona
 * igual à barra do aluno — o item aceso ganha o círculo de degradê e o outro
 * fica apagado.
 */
export function BarraAdministrador({
  onAdicionar,
  ativo,
}: BarraAdministradorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const automatico: "inicio" | "adicionar" = ROTAS_ADICIONAR.some((rota) =>
    pathname.startsWith(rota)
  )
    ? "adicionar"
    : "inicio";
  const adicionarAceso = (ativo ?? automatico) === "adicionar";

  const irParaInicio = () => {
    if (pathname === "/admin" || pathname === "/admin/") return;
    router.navigate("/admin" as never);
  };

  return (
    <View
      style={[styles.barra, { bottom: Math.max(insets.bottom, 12) }]}
      accessibilityRole="tablist"
    >
      <TouchableOpacity
        style={styles.botao}
        onPress={irParaInicio}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: !adicionarAceso }}
        accessibilityLabel="Início"
      >
        <AbaAtiva icone={ICONES.inicio} ativo={!adicionarAceso} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botao}
        onPress={onAdicionar}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: adicionarAceso }}
        accessibilityLabel="Adicionar"
      >
        <View style={styles.centroIcone}>
          {adicionarAceso ? (
            <LinearGradient
              colors={GRADIENTE_ACESO}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.circuloAtivo}
            >
              <View style={styles.anelAdicionarAtivo}>
                <Plus size={28} color="#303030" strokeWidth={3.5} />
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.adicionar}>
              <Plus size={30} color="#303030" strokeWidth={3.5} />
            </View>
          )}
        </View>
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
  adicionar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3.2,
    borderColor: "#303030",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  anelAdicionarAtivo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3.2,
    borderColor: "#303030",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
