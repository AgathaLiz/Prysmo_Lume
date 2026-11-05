import { router } from "expo-router";
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

export default function OnboardingTelaInicial() {
  const { altura, fonte, espaco } = useEscalaOnboarding();

  // a escala acompanha a altura — sem perder o enquadramento em telas grandes.
  const escalaIlustracao =
    1.9 * Math.min(1, Math.max(0.78, altura / 844));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.area} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.rolagem}
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.ilustracaoBox,
              { minHeight: Math.round(altura * 0.32) },
            ]}
          >
            <Image
              source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding1.png")}
              style={[styles.ilustracao, { transform: [{ scale: escalaIlustracao }] }]}
              resizeMode="contain"
            />
          </View>

          <View
            style={[
              styles.botoesCard,
              { paddingTop: espaco(50), paddingBottom: espaco(40) },
            ]}
          >
            <View style={styles.cardConteudo}>
              <Text style={[styles.title, { fontSize: fonte(30) }]}>
                Olá, seja Bem-Vindo
              </Text>

              <View style={styles.containerFooterText}>
                <Text
                  style={[styles.footerContinueText, { fontSize: fonte(16) }]}
                >
                  Continue
                </Text>
                <Text style={[styles.footerText, { fontSize: fonte(16) }]}>
                  para aprender a usar o Lume!
                </Text>
              </View>

              <View style={styles.botoesFinal}>
                <TouchableOpacity
                  style={[
                    styles.botaoPular,
                    { paddingVertical: espaco(15) },
                  ]}
                  onPress={() => router.push("../auth/login/contas")}
                  accessibilityRole="button"
                >
                  <Text style={[styles.botoesTexto, { fontSize: fonte(25) }]}>
                    Pular
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoComecar,
                    {
                      paddingVertical: espaco(15),
                      paddingHorizontal: Math.round(fonte(30)),
                    },
                  ]}
                  onPress={() => router.push("../onboarding/primeira_tela")}
                  accessibilityRole="button"
                >
                  <Text style={[styles.botoesTexto, { fontSize: fonte(25) }]}>
                    Começar
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#FFC629",
  },

  area: {
    flex: 1,
  },

  rolagem: {
    flex: 1,
  },

  conteudo: {
    flexGrow: 1,
  },

  ilustracaoBox: {
    flexGrow: 1, // ocupa o espaço restante, mas nunca menos que o mínimo
    width: "100%",
    backgroundColor: "#FFC629",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  ilustracao: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },

  botoesCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  cardConteudo: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },

  title: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    alignSelf: "center",
    textAlign: "center",
  },

  containerFooterText: {
    flexDirection: "row",
    flexWrap: "wrap", // em telas estreitas o texto desce em vez de estourar
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  footerContinueText: {
    marginTop: 8,
    fontFamily: "Poppins_600SemiBold",
    color: "#D987FF",
    alignSelf: "center",
  },

  footerText: {
    marginTop: 8,
    fontFamily: "Poppins_600SemiBold",
    color: "#303030",
    alignSelf: "center",
    textAlign: "center",
  },

  botoesFinal: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },

  botaoPular: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  botaoComecar: {
    marginLeft: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#D987FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  botoesTexto: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    textAlign: "center",
  },
});
