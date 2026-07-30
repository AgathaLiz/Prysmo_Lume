import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PageFlow } from "../../../components/PageFlow";

//import supabase
import { supabase } from "../../../lib/supabase";



export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    setErroLogin("E-mail ou senha incorretos");
    return;
  }


  router.push("/onboarding/comeco");
}

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/logo.jpg")}
          style={styles.logo}
        />

        <Text style={styles.titulo}>Título exemplo</Text>

        <Text style={styles.subtitulo}>
          Lorem lorem lorem lorem lorem
        </Text>
      </View>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#8C8484"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <View style={styles.senhaContainer}>
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#8C8484"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          style={styles.senhaInput}
        />

        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
          <Image
            source={require("../../../assets/images/padlock.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      
        {erroLogin !== "" &&(
          <Text style={styles.erro}>{erroLogin}</Text>
        )}


      <View style={styles.links}>
        <Text style={styles.linkClaro}>lembrar senha</Text>

        <TouchableOpacity>
          <Text style={styles.linkEscuro}>esqueceu?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botao} onPress={login}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <PageFlow
        total={4}
        currentIndex={1}
        showBack
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 25,
    justifyContent: "center",
    paddingBottom: 80,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8C8484",
    marginTop: 14,
  },

  subtitulo: {
    marginTop: 10,
    color: "#8C8484",
    fontSize: 15,
  },

  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 15,
    color: "#6E6666",
  },

  senhaContainer: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  senhaInput: {
    flex: 1,
    paddingVertical: 16,
    color: "#6E6666",
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 38,
  },

  linkClaro: {
    color: "#A5A5A5",
    fontSize: 12,
  },

  linkEscuro: {
    color: "#7A7272",
    fontWeight: "600",
    fontSize: 12,
  },

  botao: {
    backgroundColor: "#D9D9D9",
    borderRadius: 18,
    paddingVertical: 18,
  },

  botaoTexto: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    color: "#8C8484",
  },

  erro: {
    color : "#D32F2F",
    textAlign : "center",
    marginTop: 10,
    marginBottom :10,
    fontSize: 14,
  },
});