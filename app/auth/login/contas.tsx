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
import { PageFlow } from "../../../components/PageFlow";

export default function LoginSocialScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/onboarding/comeco")}
      >
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>


      <View style={styles.ilustracaoBox}>
        <Image
          source={require("../../../assets/Lume/Capa do app/Png/capa-app-roxa.png")}
          style={styles.ilustracao}
          resizeMode="contain"
        />
      </View>
      

      <Text style={styles.title}>Como deseja entrar?</Text>

      <TouchableOpacity style={styles.socialButton}  onPress={signInWithGoogle}>
        <Image
          source={require("../../../assets/images/google.png")}
          style={styles.icon}
        />
        <Text style={styles.socialText}>Entrar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={signInWithFacebook}>
        <Image
          source={require("../../../assets/images/facebook.png")}
          style={styles.icon}/>  
        <Text style={styles.socialText}>Entrar com Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => router.push("../login/login")}
      >
        <Image
          source={require("../../../assets/images/facebook.png")}
          style={styles.icon}
        />
        <Text style={styles.socialText}>Fazer Login</Text>
      </TouchableOpacity>

      <View style={styles.cadastroCard}>

        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
        <TouchableOpacity
          style={styles.cadastroButton}
          onPress={() => router.push("../cadastro")}>
          <Text style={styles.cadastroText}>Se Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <PageFlow total={4} currentIndex={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 80,
  },

  backButton: {
    position: "absolute",
    top: 45,
    left: 25,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 25,
    lineHeight: 24,
    color: "#9A9A9A",
  },

  ilustracaoBox: {
    width: 200,
    height: 150,
    borderRadius: 130,
    marginTop: 60,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  
  ilustracao: {
    width: "60%",
    height: "76%",
    alignSelf: "center",
    borderRadius: 10,
    
  },

  title: {
    marginTop: 0,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#8A8080",
  },


  socialButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#353435",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  socialText: {
    paddingLeft: 12,
    color: "#6E6666",
    fontWeight: "600",
    fontSize: 15,
  },

   cadastroCard: {
    width: "70%",
    marginTop: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  footerText: {
    marginTop: 5,
    fontSize: 15,
    color: "#9A8F8F",
  },

 cadastroButton: {
    marginTop: 10,
    backgroundColor: "#D9D9D9",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cadastroText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6E6666",
  },
});