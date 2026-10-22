import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  Calendar,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { PageFlow } from "../../components/PageFlow";

//import do subase
import { supabase } from "../../lib/supabase";

// nomes dos objetos que vão guardar as informações
export default function CadastroScreen() {
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erros, setErros] = useState({
  nome: "",
  nascimento: "",
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
});

// Mascáras = (12) 3456 - 78901
  function mascaraData(valor: string) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
}

function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

function emailValido(valor: string) {
  return /\S+@\S+\.\S+/.test(valor);
}

//formatar data
function formatarData(data: string) {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}



function dataValida(valor: string) {
  const [d, m, a] = valor.split("/").map(Number);
  if (!d || !m || !a || a < 1900) return false;
  const dt = new Date(a, m - 1, d);
  return dt.getFullYear() === a && dt.getMonth() === m - 1 && dt.getDate() === d && dt <= new Date();
}

async function cadastrarUsuario() {
  if (carregando) return;
  setErroGeral("");

  const novosErros = { nome: "", nascimento: "", telefone: "", email: "", senha: "", confirmarSenha: "" };

  if (!nome.trim()) novosErros.nome = "Preencha o nome";
  if (!dataValida(nascimento)) novosErros.nascimento = "Data inválida";
  if (telefone.replace(/\D/g, "").length < 10) novosErros.telefone = "Telefone inválido";
  if (!emailValido(email)) novosErros.email = "E-mail inválido";
  if (senha.length < 6) novosErros.senha = "Mínimo de 6 caracteres";
  if (senha !== confirmarSenha) novosErros.confirmarSenha = "Senhas diferentes";

  setErros(novosErros);
  if (Object.values(novosErros).some((e) => e !== "")) return;

  setCarregando(true);
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: {
      data: {
        nome_completo: nome.trim(),
        telefone,
        data_nascimento: formatarData(nascimento),
      },
    },
  });
  setCarregando(false);

  if (error) {
    setErroGeral("Não foi possível criar a conta. Verifique os dados e tente novamente.");
    console.log(error.message);
    return;
  }

  router.replace("/auth/tela_preferencias");
}

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Botão para levar a página de login */}
       <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.push("../auth/login/contas")}
        >
          <ChevronLeft size={25} color="#303030" />
        </TouchableOpacity>

      {/* mascote + Balão */}
      <View style={styles.topContainer}>
        <TouchableOpacity >
                    <Image
                        source={require("../../assets/Lume/Mimi/Png/mimi-ensinando.png")}
                        style={styles.photoBox}
                    />
                </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <Text style={styles.messageText}>
            Insira seus dados pessoais para criar uma conta!
          </Text>
        </TouchableOpacity>
      </View>

{/* Campos para preencher do formulário */}
      <View style={styles.row}>
      <View style={[styles.inputWrapper, styles.halfInput]}>
    <User size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Nome"
      placeholderTextColor="#303030"
      value={nome}
      onChangeText={setNome}
      style={[styles.input, styles.inputWithIcon]}
    />
    {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null} {/* O if verificou que o campo não foi preenchido essa mensagem de erro aparece */}
  </View>

  <View style={[styles.inputWrapper, styles.halfInput]}>
    <Calendar size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Nascimento"
      placeholderTextColor="#303030"
      value={nascimento}
      keyboardType="numeric"
      maxLength={10}
      onChangeText={(texto) => setNascimento(mascaraData(texto))}
      style={[styles.input, styles.inputWithIcon]}
    />
    {erros.nascimento ? (
      <Text style={styles.errorText}>{erros.nascimento}</Text>
    ) : null}
  </View>
</View>

<View style={styles.inputWrapper}>
  <Phone size={20} color="#303030" style={styles.icon} />
  <TextInput
    placeholder="Telefone"
    placeholderTextColor="#303030"
    value={telefone}
    keyboardType="phone-pad"
    maxLength={15}
    onChangeText={(texto) => setTelefone(mascaraTelefone(texto))}
    style={[styles.input, styles.inputWithIcon]}
  />
  {erros.telefone ? (
    <Text style={styles.errorText}>{erros.telefone}</Text>
  ) : null}
</View>

<View style={styles.inputWrapper}>
  <Mail size={20} color="#303030" style={styles.icon} />
  <TextInput
    placeholder="E-mail"
    placeholderTextColor="#303030"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    autoCapitalize="none"
    style={[styles.input, styles.inputWithIcon]}
  />
  {erros.email ? <Text style={styles.errorText}>{erros.email}</Text> : null}
</View>

  <View style={styles.row}>
    <View style={[styles.inputWrapper, styles.halfInput]}>
      <Lock size={20} color="#303030" style={styles.icon} />
      <TextInput
        placeholder="Criar senha"
        placeholderTextColor="#303030"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={[styles.input, styles.inputWithIcon]}
      />
    </View>

    <View style={[styles.inputWrapper, styles.halfInput]}>
      <Lock size={20} color="#303030" style={styles.icon} />
      <TextInput
        placeholder="Repetir senha"
        placeholderTextColor="#303030"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        style={[styles.input, styles.inputWithIcon]}
      />
    </View>
  </View>

  {/* Erros das senhas */}
  {erros.senha ? <Text style={styles.errorText}>{erros.senha}</Text> : null}
  {erros.confirmarSenha ? <Text style={styles.errorText}>{erros.confirmarSenha}</Text> : null}

  {/* Erro geral do cadastro */}
  {erroGeral ? <Text style={styles.errorText}>{erroGeral}</Text> : null}

  {/* Botão que conclui o cadastro */}
  <TouchableOpacity
    style={[styles.button, carregando && { opacity: 0.6 }]}
    onPress={cadastrarUsuario}
    disabled={carregando}
  >
    <Text style={styles.buttonText}>{carregando ? "Criando..." : "Cadastrar"}</Text>
  </TouchableOpacity>
      
        <PageFlow total={4} currentIndex={1} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9B8FF",
  },

  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 100,   // espaço extra no final pra não cortar o último campo
    
  },

  

  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  photoBox: {
    marginTop: 20,
    width: 120,
    height: 180,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  photoIcon: {
    fontSize: 28,
  },

  messageBox: {
    flex: 1,
    marginLeft: 15,
    backgroundColor: "#FFE169",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  messageText: {
    textAlign: "center",
    color: "#303030",
    fontSize: 20,
    fontFamily:"Poppins_600SemiBold",
  },

  errorText: {
  color: "#C04B4B",
  fontFamily:"Poppins_600SemiBold",
  fontSize: 15,
  marginTop: -10,
  marginBottom: 10,
  marginLeft: 15,
},

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  input: {
    backgroundColor: "#FFFFFF",
    height: 62,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 15,
    fontSize: 16,
    fontFamily:"Poppins_600SemiBold",
    color:"#303030",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
   
  },

  halfInput: {
    width: "48%",
  },

  button: {
    marginTop: 25,
    marginBottom: 10,
    backgroundColor: "#FFD651",
    borderRadius: 35,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  footer: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoVoltar: {
   width: 60,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

inputWrapper: {
  position: "relative",
  width: "100%",
  fontSize: 14,
  
},

icon: {
  position: "absolute",
  left: 15,
  top: 16,
  zIndex: 1,
  marginTop: 5,
},

inputWithIcon: {
  paddingLeft: 45,
  color: "#303030",
},

});