import { signInWithFacebook, signInWithGoogle } from "@/services/authService";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PageFlow } from "../../components/PageFlow";

export default function OnboardingTelaInicial() {
  return (
    <View style={styles.container}>
      
      <View style={styles.ilustracaoBox}>
        <Image
          source={require("../../assets/Lume/Facilidades pro app/Png/Onboarding/fundoOnboarding1.png")}
          style={styles.ilustracao}
          resizeMode="contain"
        />
      </View>
      

      <View style={styles.botoesCard}>

        <Text style={styles.title}>Olá, seja Bem-Vindo</Text>

        <Text style={styles.footerText}>Continue para aprender a usar o Lume!</Text>

        <View style={styles.botoesFinal}>
            <TouchableOpacity
                style={styles.botaoPular}
                onPress={() => router.push("../auth/login/contas")}>
                <Text style={styles.botoesTexto}>Pular</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("../onboarding/primeira_tela")}>
                  <LinearGradient
                    colors={["#FFD651", "#D987FF"]}
                    start={{x:0, y:0}}
                    end={{x:1, y:1}}
                    style={styles.botaoComecar}>
                    <Text style={styles.botoesTexto}>Começar</Text>
                  </LinearGradient>
    
            </TouchableOpacity>        
        </View>  
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC629",
  },

    ilustracaoBox: {
    flex: 1,                    // ocupa todo o espaço restante, nem mais nem menos
    width: "100%",
    backgroundColor: "#FFC629",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  ilustracao: {
    width: "100%",
    height: "76%",
    alignSelf: "center",
    marginTop: 25,
    transform: [
        {scale: 1.9},
    ]
  },

  botoesCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 40,
    marginTop: "auto",
    justifyContent: "center",
    
  },

  title: {
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    alignSelf: "center",
  },

  footerText: {
    marginTop: 8,
    fontFamily:"Poppins_600SemiBold",
    fontSize: 16,
    color: "#303030",
    alignSelf: "center",
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
  paddingVertical: 15,
  alignItems: "center",
  borderWidth: 1.5,
  borderColor: "#E0E0E0",
  },

  botaoComecar: {
  marginLeft: 10,
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 20,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4,
},

  botoesTexto: {
    fontSize: 25,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
});