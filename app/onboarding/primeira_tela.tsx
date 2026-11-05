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

import { useEscalaOnboarding } from "@/lib/onboarding";

export default function OnboardingIntroducaoUm() {
  const { fonte, espaco, quadrado } = useEscalaOnboarding();
  const ladoBotao = quadrado(120);

  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
        <Image
          source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding2.png")}
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
            <Text style={[styles.titulo, { fontSize: fonte(35) }]}>
              Te inclui
            </Text>

            <Text
              style={[
                styles.subtitulo,
                { fontSize: fonte(18), lineHeight: fonte(21) },
              ]}
            >
              Com tudo que você precisa para{"\n"}
              ser independente e presente{"\n"}
              digitalmente
            </Text>

            {/* Empurra o botão para o rodapé em telas altas e encolhe em
                telas baixas (antes era um marginTop fixo de 450px). */}
            <View style={styles.espacador} />

            <TouchableOpacity
              style={[
                styles.botaoProximo,
                {
                  width: ladoBotao,
                  height: ladoBotao,
                  borderRadius: ladoBotao / 2,
                },
              ]}
              onPress={() => router.push("../onboarding/segunda_tela")}
              accessibilityRole="button"
              accessibilityLabel="Próxima tela"
            >
              <ChevronRight
                size={Math.round(ladoBotao * 0.42)}
                color="#D987FF"
              />
            </TouchableOpacity>
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
    transform: [{ scale: 1.5 }],
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

  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#2E1A47",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#3A2A50",
    textAlign: "center",
  },

  espacador: {
    flex: 1,
    minHeight: 24,
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
