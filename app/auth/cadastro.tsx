import { router } from "expo-router";
import {
  Calendar,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// nomes dos objetos que vão guardar as informações
export default function CadastroScreen() {
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

// Função para verificar o formulário
function validarFormulario() {
  const novosErros = {
    nome: "",
    nascimento: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  };

  if (!nome.trim()) {
    novosErros.nome = "Preencha o nome";
  }

  if (!nascimento.trim()) {
    novosErros.nascimento = "Preencha a data";
  } else if (nascimento.length < 10) {
    novosErros.nascimento = "Data incompleta";
  }

  if (!telefone.trim()) {
    novosErros.telefone = "Preencha o telefone";
  } else if (telefone.length < 15) {
    novosErros.telefone = "Telefone incompleto";
  }

  if (!email.trim()) {
    novosErros.email = "Preencha o e-mail";
  } else if (!emailValido(email)) {
    novosErros.email = "E-mail inválido";
  }

  if (!senha.trim()) {
    novosErros.senha = "Preencha a senha";
  } else if (senha.length < 6) {
    novosErros.senha = "Mínimo de 6 caracteres";
  }

  if (!confirmarSenha.trim()) {
    novosErros.confirmarSenha = "Repita a senha";
  } else if (senha !== confirmarSenha) {
    novosErros.confirmarSenha = "As senhas são diferentes";
  }

  // Verificar se o campo do formulário foi preenchido, se não, uma mensagem em vermelho vai aparecer, pedindo pro usuário preencher
  setErros(novosErros);

  const temErro = Object.values(novosErros).some((erro) => erro !== "");

  if (temErro) {
    return;
  }

// Se o cadastro foi feito com sucesso, automaticamnete o usuário é jogado para o login (futuramente ele vai ser jogado pra tela inicial)
  router.push("/auth/login/login");
}

  return (
    <View style={styles.container}>
      {/* mascote + Balão */}
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.photoBox}>
                    <Image
                        source={require("../../assets/images/logo.jpg")}
                        style={styles.photoBox}
                    />
                </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <Text style={styles.messageText}>
            Clique para preencher as informações
          </Text>
        </TouchableOpacity>
      </View>

{/* Campos para preencher do formulário */}
      <View style={styles.row}>
  <View style={[styles.inputWrapper, styles.halfInput]}>
    <User size={18} color="#8C8484" style={styles.icon} />
    <TextInput
      placeholder="Nome"
      placeholderTextColor="#8C8484"
      value={nome}
      onChangeText={setNome}
      style={[styles.input, styles.inputWithIcon]}
    />
    {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null} {/* O if verificou que o campo não foi preenchido essa mensagem de erro aparece */}
  </View>

  <View style={[styles.inputWrapper, styles.halfInput]}>
    <Calendar size={18} color="#8C8484" style={styles.icon} />
    <TextInput
      placeholder="Nascimento"
      placeholderTextColor="#8C8484"
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
  <Phone size={18} color="#8C8484" style={styles.icon} />
  <TextInput
    placeholder="Telefone"
    placeholderTextColor="#8C8484"
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
  <Mail size={18} color="#8C8484" style={styles.icon} />
  <TextInput
    placeholder="E-mail"
    placeholderTextColor="#8C8484"
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
    <Lock size={18} color="#8C8484" style={styles.icon} />
    <TextInput
      placeholder="Criar senha"
      placeholderTextColor="#8C8484"
      secureTextEntry
      value={senha}
      onChangeText={setSenha}
      style={[styles.input, styles.inputWithIcon]}
    />
  </View>

  <View style={[styles.inputWrapper, styles.halfInput]}>
    <Lock size={18} color="#8C8484" style={styles.icon} />
    <TextInput
      placeholder="Repetir senha"
      placeholderTextColor="#8C8484"
      secureTextEntry
      value={confirmarSenha}
      onChangeText={setConfirmarSenha}
      style={[styles.input, styles.inputWithIcon]}
    />
  </View>
</View>

      {/* Botão que conclui o envio do formulário */}
      <TouchableOpacity style={styles.button} onPress={validarFormulario}>
  <Text style={styles.buttonText}>CONCLUIR</Text>
</TouchableOpacity>
      
      {/* Botão para levar a página de login */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/auth/login/login")}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 25,
    paddingTop: 70,
  },

  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 60,
  },

  photoBox: {
    width: 70,
    height: 70,
    backgroundColor: "#D9D9D9",
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
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 15,
  },

  messageText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  errorText: {
  color: "#C04B4B",
  fontSize: 11,
  marginTop: -10,
  marginBottom: 10,
  marginLeft: 15,
},

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 15,
  },

  halfInput: {
    width: "48%",
  },

  button: {
    marginTop: 25,
    backgroundColor: "#D9D9D9",
    borderRadius: 35,
    paddingVertical: 18,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#555",
  },

  footer: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },

  backText: {
    fontSize: 20,
  },
inputWrapper: {
  position: "relative",
},

icon: {
  position: "absolute",
  left: 15,
  top: 16,
  zIndex: 1,
},

inputWithIcon: {
  paddingLeft: 45,
},

});