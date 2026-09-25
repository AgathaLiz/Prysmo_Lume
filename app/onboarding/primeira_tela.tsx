import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingIntroducaoUm() {
  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
        <Image
          source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding2.png")}
          style={styles.imagemFundo}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.titulo}>Te inclui</Text>

      <Text style={styles.subtitulo}>
        Com tudo que você precisa para{"\n"}
        ser independente e presente{"\n"}
        digitalmente
      </Text>

      <TouchableOpacity
        style={styles.botaoProximo}
        onPress={() => router.push("../onboarding/segunda_tela")}
      >
        <ChevronRight size={50} color="#D987FF" />
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

  titulo: {
    fontSize: 35,
    fontFamily: "Poppins_800ExtraBold",
    color: "#2E1A47",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 10,
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold",
    color: "#3A2A50",
    textAlign: "center",
    lineHeight: 20,
  },

  botaoProximo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#32064F",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});