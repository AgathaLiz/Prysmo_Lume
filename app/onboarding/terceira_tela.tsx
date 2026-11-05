import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useEscalaOnboarding } from "@/lib/onboarding";

export default function OnboardingIntroducaoDois() {
  const { fonte, espaco, quadrado } = useEscalaOnboarding();

  const anel = quadrado(140);
  const centro = anel / 2;
  const raio = Math.round(58 * (anel / 140));
  const ladoBotao = quadrado(100);
  const proporcao = anel / 140;

  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
        <Image
          source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding4.png")}
          style={styles.imagemFundo}
          resizeMode="cover"
        />
      </View>

      <SafeAreaView style={styles.area} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.rolagem}
          contentContainerStyle={[
            styles.conteudo,
            { paddingTop: espaco(70), paddingBottom: espaco(40) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.coluna}>
            <Text
              style={[
                styles.titulo,
                { fontSize: fonte(35), marginTop: espaco(50) },
              ]}
            >
              Ilumina
            </Text>

            <Text
              style={[
                styles.subtitulo,
                { fontSize: fonte(18), lineHeight: fonte(21) },
              ]}
            >
              Com Lume, você se livra daquilo{"\n"}
              que bloqueia sua aprendizagem{"\n"}
              de habilidades digitais!
            </Text>

            {/* Antes era marginTop 425 fixo: em telas baixas o botão ficava
                abaixo do rodapé visível, sem rolagem. */}
            <View style={styles.espacador} />

            <View
              style={[
                styles.voltaBotao,
                { width: anel, height: anel, marginTop: espaco(24) },
              ]}
            >
              <Svg width={anel} height={anel} style={styles.progresso}>
                <Circle
                  cx={centro}
                  cy={centro}
                  r={raio}
                  stroke="#32064F"
                  strokeWidth={6}
                  fill="none"
                  strokeDasharray={`${Math.round(402 * proporcao)}, ${Math.round(
                    402 * proporcao
                  )}`}
                  strokeLinecap="round"
                  rotation={90}
                  origin={`${centro}, ${centro}`}
                />
              </Svg>

              <TouchableOpacity
                style={[
                  styles.botaoProximo,
                  {
                    width: ladoBotao,
                    height: ladoBotao,
                    borderRadius: ladoBotao / 2,
                  },
                ]}
                onPress={() => router.push("../auth/login/contas")}
                accessibilityRole="button"
                accessibilityLabel="Ir para o login"
              >
                <ChevronRight
                  size={Math.round(ladoBotao * 0.5)}
                  color="#891CC0"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#891CC0",
  },

  imagemContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },

  imagemFundo: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.3 }, { translateY: -40 }],
  },

  area: {
    flex: 1,
  },

  rolagem: {
    flex: 1,
  },

  conteudo: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 25,
  },

  coluna: {
    width: "100%",
    maxWidth: 520,
    flexGrow: 1,
    alignItems: "center",
  },

  espacador: {
    flex: 1,
    minHeight: 24,
  },

  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 5,
    marginBottom: 5,
    fontFamily: "Poppins_600SemiBold",
    color: "#303030",
    textAlign: "center",
  },

  voltaBotao: {
    justifyContent: "center",
    alignItems: "center",
  },

  progresso: {
    position: "absolute",
  },

  botaoProximo: {
    backgroundColor: "#32064F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
