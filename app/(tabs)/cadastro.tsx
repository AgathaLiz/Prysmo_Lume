import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from "react-native";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Lock,
} from "lucide-react-native";

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  return (
    <View style={styles.container}>
      {/* mascote + Balão */}
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.photoBox}>
                    <Image
                        source={require("../../assets/images/download (1).jpg")}
                        style={styles.photoBox}
                    />
                </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <Text style={styles.messageText}>
            Clique para preencher as informações
          </Text>
        </TouchableOpacity>
      </View>

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
  </View>

  <View style={[styles.inputWrapper, styles.halfInput]}>
    <Calendar size={18} color="#8C8484" style={styles.icon} />
    <TextInput
      placeholder="Nascimento"
      placeholderTextColor="#8C8484"
      value={nascimento}
      onChangeText={setNascimento}
      style={[styles.input, styles.inputWithIcon]}
    />
  </View>
</View>

<View style={styles.inputWrapper}>
  <Phone size={18} color="#8C8484" style={styles.icon} />
  <TextInput
    placeholder="Telefone"
    placeholderTextColor="#8C8484"
    value={telefone}
    onChangeText={setTelefone}
    style={[styles.input, styles.inputWithIcon]}
  />
</View>

<View style={styles.inputWrapper}>
  <Mail size={18} color="#8C8484" style={styles.icon} />
  <TextInput
    placeholder="E-mail"
    placeholderTextColor="#8C8484"
    value={email}
    onChangeText={setEmail}
    style={[styles.input, styles.inputWithIcon]}
  />
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

      {/* Botão */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>CONCLUIR</Text>
      </TouchableOpacity>

      {/* Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton}>
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