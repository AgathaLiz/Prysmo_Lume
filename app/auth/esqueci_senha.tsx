import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase"; // mesmo import da verificar_email

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const { width } = useWindowDimensions();
  const larguraLogo = Math.min(width * 0.3, 120);

  function emailValido(valor: string) {
    return /\S+@\S+\.\S+/.test(valor);
  }

  async function enviarCodigo() {
    if (carregando) return;
    setErro("");

    if (!emailValido(email.trim())) {
      setErro("Digite um e-mail válido");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setCarregando(false);

    if (error) {
      console.log(error.message);
      if (error.status === 429 || error.message.toLowerCase().includes("rate limit")) {
        setErro("Muitos pedidos seguidos. Espere um pouco e tente de novo.");
      } else {
        setErro("Não foi possível enviar o código. Verifique sua conexão e tente novamente.");
      }
      return;
    }

    // O Supabase responde com sucesso mesmo se o e-mail não tiver conta,
    // por isso a tela seguinte usa um texto neutro.
    router.push(`/auth/redefinir_senha?email=${encodeURIComponent(email.trim())}` as any);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#E9B8FF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.conteudo}>
          {/* Botão para voltar */}
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
            <ChevronLeft size={25} color="#303030" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.textoContainer}>
              <Text style={styles.titulo}>{"Esqueceu\na senha?"}</Text>
              <Text style={styles.subtitulo}>Vamos enviar um código para o seu e-mail</Text>
            </View>

            <Image
              source={require("../../assets/Lume/Mimi/Png/mimi-pra-esquerda.png")} // mantenha o mesmo caminho que funciona na verificar_email
              style={[styles.logo, { width: larguraLogo, height: larguraLogo * (200 / 140) }]}
            />
          </View>

          {/*EMAIL*/}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#303030"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

          {/*BOTÃO*/}
          <TouchableOpacity
            onPress={enviarCodigo}
            disabled={carregando}
            style={[styles.botao, carregando && { opacity: 0.6 }]}
          >
            <Text style={styles.botaoTexto}>{carregando ? "Enviando..." : "Enviar código"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  conteudo: {
    width: "100%",
    maxWidth: 480,
  },

  botaoVoltar: {
    width: 60,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  textoContainer: {
    flex: 1,
    paddingRight: 10,
    marginLeft: 10,
  },

  logo: {
    resizeMode: "contain",
  },

  titulo: {
    fontSize: 28,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  subtitulo: {
    marginTop: 10,
    color: "#303030",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
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
    minWidth: 0,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },

  botao: {
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#FFD651",
  },

  botaoTexto: {
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  erro: {
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});