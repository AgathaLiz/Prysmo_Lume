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
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <Image
        source={require("../../../assets/images/logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Título exemplo</Text>

      <Text style={styles.subtitle}>
        Loren loren loren loren loren loren{"\n"}
        loren loren loren loren loren{"\n"}
        loren loren loren loren.
      </Text>

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

      <Text style={styles.footerText}>
        Não tem conta?{" "}
        <Text
          style={styles.bold}
          onPress={() => router.push("../cadastro")}> Crie uma! </Text> {/* Função para levar o usuário para a página cadastro */}
      </Text>
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
    fontSize: 24,
    lineHeight: 24,
    color: "#9A9A9A",
  },

  logo: {
    width: 120,
    height: 120,
  },

  title: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: "bold",
    color: "#8A8080",
  },

  subtitle: {
    marginTop: 15,
    textAlign: "center",
    color: "#8A8080",
    fontSize: 14,
    lineHeight: 20,
  },

  socialButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  },

  footerText: {
    marginTop: 25,
    fontSize: 11,
    color: "#9A8F8F",
  },

  bold: {
    fontWeight: "bold",
    color: "#6E6666",
  },
});