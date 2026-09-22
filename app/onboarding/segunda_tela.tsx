import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingIntroducaoDois() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding2.png")}
        style={styles.imagemFundo}
        resizeMode="cover"
      />

      <Text style={styles.titulo}>Te inclui</Text>

      <Text style={styles.subtitulo}>
        Com tudo que você precisa para{"\n"}
        ser independente e presente{"\n"}
        digitalmente
      </Text>

      <TouchableOpacity
        style={styles.botaoProximo}
        onPress={() => router.push("../proxima-tela")}
      >
        <ChevronRight size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#891CC0",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  imagemFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E1A47",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#3A2A50",
    textAlign: "center",
    lineHeight: 20,
  },

  botaoProximo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#32064F",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});