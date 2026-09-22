import { signInWithFacebook, signInWithGoogle } from "@/services/authService";
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

export default function OnboardingIntroducaoUm() {
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
                style={styles.botoes}
                onPress={() => router.push("../cadastro")}>
                <Text style={styles.botoesTexto}>Pular</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botoes}
                onPress={() => router.push("../cadastro")}>
                <Text style={styles.botoesTexto}>Começar</Text>
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
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
    marginTop: "auto",
    justifyContent: "center",
    
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#303030",
    alignSelf: "center",
  },

  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#303030",
    alignSelf: "center",
  },

  botoesFinal: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },

  botoes: {
    flex: 1,
    backgroundColor: "#D987FF",
    borderRadius: 20,
    paddingVertical: 15,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#616161",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  botoesTexto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#303030",
  },
});