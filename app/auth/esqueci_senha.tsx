import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageFlow } from "../../components/PageFlow";
import { supabase } from "../../lib/supabase"; // mesmo import da verificar_email

export default function EsqueciSenhaScreen() {
  const insets = useSafeAreaInsets();
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
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableOpacity
        style={[styles.botaoVoltarTopo, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft size={26} color="#303030" strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 70, paddingBottom: 96 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
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
            <Mail size={22} color="#303030" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#5A535E"
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

      <PageFlow total={4} currentIndex={1} />
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

  botaoVoltarTopo: {
    position: "absolute",
    left: 20,
    zIndex: 5,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5B4FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
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
    fontSize: 32,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  subtitulo: {
    marginTop: 8,
    color: "#303030",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },

  inputContainer: {
    backgroundColor: "#F0EEF2",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#D9A8F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 15,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },

  botao: {
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#D689FF",
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