import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingIntroducaoDois() {
  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
        <Image
          source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding4.png")}
          style={styles.imagemFundo}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.titulo}>Ilumina</Text>

      <Text style={styles.subtitulo}>
        Com Lume, você se livra daquilo{"\n"}
        que bloqueia sua aprendizagem{"\n"}
        de habilidades digitais!
      </Text>

      <View style={styles.voltaBotao}>
        <Svg 
          width={140}
          height={140}
          style={styles.progresso}>

          <Circle
            cx={70}
            cy={70}
            r={58}
            stroke="#32064F"
            strokeWidth={6}
            fill="none"
            strokeDasharray="402, 402"
            strokeLinecap="round"
            rotation={90}
            origin="70, 70"></Circle>
        </Svg>

        <TouchableOpacity
          style={styles.botaoProximo}
          onPress={() => router.push("../auth/login/contas")}
        >
          <ChevronRight size={50} color="#891CC0" />
        </TouchableOpacity>
      </View>

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
    transform: [
    { scale: 1.3 },
    { translateY: -40 },
    ],
  },

  titulo: {
    fontSize: 35,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    textAlign: "center",
    marginTop:50,
  },

  subtitulo: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold",
    color: "#303030",
    textAlign: "center",
    lineHeight: 20,
  },

  voltaBotao: {
    width: 100,
    height: 100,
    marginTop: 425,
    justifyContent: "center",
    alignItems: "center",
    
  },

  progresso: {
    position: "absolute",
  },

  botaoProximo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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