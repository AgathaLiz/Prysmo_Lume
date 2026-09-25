import { router } from "expo-router";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
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
            
      <View style={styles.imagemContainer}>
          <Image
            source={require("../../../assets/Lume/Facilidades pro app/Png/Outros Fundos/fundoMaior.png")}
            style={styles.imagemFundo}
            resizeMode="cover"
          />
      </View>
      {/* Botão para voltar */}
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.push("../login/contas")}
        >
          <ChevronLeft size={25} color="#303030" />
        </TouchableOpacity>
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
          placeholderTextColor="#303030"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>
      

      <View style={styles.senhaContainer}>
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#303030"
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

      <TouchableOpacity onPress={Login}>
         <LinearGradient
                      colors={["#FFD651", "#D987FF"]}
                      start={{x:0, y:0}}
                      end={{x:1, y:1}}
                      style={styles.botao}>
                      <Text style={styles.botaoTexto}>Entrar</Text>
                    </LinearGradient>
      </TouchableOpacity>

    
      
        <PageFlow total={4} currentIndex={1} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    paddingBottom: 80,
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

  logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 35,
  },

  textoContainer: {
    flex: 1,
    paddingRight: 10,
    marginLeft: 20,
},

  logo: {
    width: 140,
    height: 200,
    resizeMode: "contain",
  },

  titulo: {
    fontSize: 35,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    
  },

  subtitulo: {
    marginTop: 10,
    color: "#303030",
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold",
  },

  inputContainer: {
    backgroundColor: "#FFFFFF",
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
    color: "#303030",
    fontSize: 20,
    fontFamily:"Poppins_600SemiBold",
  },

  senhaContainer: {
    backgroundColor: "#FFFFFF",
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
    color: "#303030",
    fontSize: 20,
    fontFamily:"Poppins_600SemiBold",
    
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
    borderColor: "#303030",
    marginRight: 6,
  },

  continuarConectadoAtivo: {
    backgroundColor: "#303030",
  },

    continuarConectadoTexto: {
    color: "#303030",
    fontSize: 17,
    fontFamily:"Poppins_600SemiBold",
  },

   linkClaro: {
    color: "#303030",
    fontSize: 20,
    fontFamily:"Poppins_600SemiBold",
  },

  linkEscuro: {
    color: "#303030",
    fontWeight: "600",
    fontSize: 17,
    fontFamily:"Poppins_600SemiBold",
  },

  botao: {
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },

  botaoTexto: {
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  

  erro: {
    color : "#D32F2F",
    textAlign : "center",
    marginTop: 10,
    marginBottom :10,
    fontSize: 14,
    fontFamily:"Poppins_600SemiBold",
  },

  rodape: {
  flexDirection: "row",
  alignItems: "center",
  gap: 15,
},

  botaoVoltar: {
   width: 60,
  height: 40,
  borderRadius: 10,
  backgroundColor: "#FFFFFF",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 5,
  },
});