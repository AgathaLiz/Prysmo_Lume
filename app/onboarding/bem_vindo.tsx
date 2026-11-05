import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageFlow } from "../../components/PageFlow";
import { useEscalaOnboarding } from "@/lib/onboarding";



export default function BemVindoScreen() {
 useEffect(() => {
  const timer = setTimeout(() => {
    router.replace("/pages/tela_inicial" as any);
  }, 2500);
  return () => clearTimeout(timer);
}, []);

  const { altura, largura, fonte, espaco } = useEscalaOnboarding();

  // A Mimi agora acompanha a menor dimensão da tela.
  const larguraMimi = Math.round(Math.min(largura * 0.64, altura * 0.36, 250));

  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
                <Image
                    source={require("../../assets/Lume/Facilidades pro app/Png/Outros Fundos/fundoMaior.png")}
                    style={styles.imagemFundo}
                    resizeMode="cover"
                  />
              </View>

      <SafeAreaView style={styles.area} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.rolagem}
          contentContainerStyle={[
            styles.conteudo,
            {
              paddingTop: espaco(72),
              paddingBottom: espaco(80),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.desenhoBox}>
            <Image
              source={require("../../assets/Lume/Mimi/Png/mimi-voando.png")}
              style={[
                styles.logo,
                { width: larguraMimi, height: Math.round(larguraMimi * 1.2) },
              ]}
            />
          </View>

          <Text
            style={[
              styles.titulo,
              { fontSize: fonte(35), marginTop: espaco(105) },
            ]}
          >
            Bem Vindo (a)
          </Text>
        </ScrollView>

        <PageFlow total={4} currentIndex={3} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
      transform: [
      { scale: 1.3 },
      { translateY: -40 },
      ],
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

  logo: {
    resizeMode: "contain",
    overflow: "hidden",
    transform: [{ rotate: "340deg" }],
  },

  desenhoBox: {
    alignItems: "center",
    justifyContent: "center",
  },


  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    textAlign: "center",
  },
});
