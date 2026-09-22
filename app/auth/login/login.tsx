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
  const [erroLogin, setErroLogin] = useState("");const [continuarConectado, setContinuarConectado] = useState(false);

  async function Login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    setErroLogin("E-mail ou senha incorretos");
    return;
  }


  router.push("/auth/tela_preferencias");
}



  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.textoContainer}>
          <Text style={styles.titulo}>Login</Text>
          <Text style={styles.subtitulo}>
            Insira os dados da sua conta Lume
          </Text>
        </View>

        <Image
          source={require("../../../assets/Lume/Mimi/Png/mimi-pra-esquerda.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#8C8484"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>
      

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

        <TouchableOpacity
          style={styles.continuarConectadoRow}
          onPress={() => setContinuarConectado(!continuarConectado)}>
          
          <View 
          style={[styles.continuarConectadoBox, continuarConectado && styles.continuarConectadoAtivo,]}>
          </View>
          <Text style={styles.continuarConectadoTexto}>Continuar conectado?</Text>
          </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("../cadastro")}>
          <Text style={styles.linkEscuro}>Criar conta?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botao} onPress={Login}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <PageFlow
        total={4}
        currentIndex={1}
        showBack
        onBack={() => router.push("../login/contas")}
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 35,
  },

  textoContainer: {
    flex: 1,
    paddingRight: 10,
},

  logo: {
    width: 140,
    height: 200,
    resizeMode: "contain",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#8C8484",
    
  },

  subtitulo: {
    marginTop: 10,
    color: "#8C8484",
    fontSize: 15,
  },

  inputContainer: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    color: "#6E6666",
    fontSize: 20,
  },

  senhaContainer: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  senhaInput: {
    flex: 1,
    paddingVertical: 16,
    color: "#6E6666",
    fontSize: 20,
    
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

  continuarConectadoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  continuarConectadoBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A5A5A5",
    marginRight: 6,
  },

  continuarConectadoAtivo: {
    backgroundColor: "#A5A5A5",
  },

    continuarConectadoTexto: {
    color: "#A5A5A5",
    fontSize: 15,
  },

   linkClaro: {
    color: "#A5A5A5",
    fontSize: 15,
  },

  linkEscuro: {
    color: "#7A7272",
    fontWeight: "600",
    fontSize: 15,
  },

  botao: {
    backgroundColor: "#D9D9D9",
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  botaoTexto: {
    textAlign: "center",
    fontSize: 24,
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