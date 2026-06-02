import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");

  return (
    <View style={styles.container}>
      {/* Voltar */}
      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../../assets/images/download (1).jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>
        Título exemplo
      </Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Loren loren loren loren loren loren{"\n"}
        loren loren loren loren loren{"\n"}
        loren loren loren loren.
      </Text>

      {/* Campo Google */}
      <View style={styles.inputContainer}>
        <Image
          source={require("../../assets/images/google.png")}
          style={styles.icon}
        />

        <TextInput
          placeholder="Loren loren loren"
          placeholderTextColor="#9A8F8F"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      {/* Campo Usuário */}
      <View style={styles.inputContainer}>
        <Image
          source={require("../../assets/images/favicon.png")}
          style={styles.icon}
        />

        <TextInput
          placeholder="Loren loren loren"
          placeholderTextColor="#9A8F8F"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
      </View>

      {/* Rodapé */}
      <Text style={styles.footerText}>
        Não tem conta?{" "}
        <Text style={styles.bold}>Crie uma!</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 25,
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 25,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 22,
    color: "#9A9A9A",
  },

  logo: {
    width: 120,
    height: 120,
    marginTop: 80,
  },

  title: {
    marginTop: 20,
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

  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    marginTop: 20,
    paddingHorizontal: 15,
  },

  icon: {
    width: 24,
    height: 24,
  },

  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 10,
    color: "#6E6666",
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