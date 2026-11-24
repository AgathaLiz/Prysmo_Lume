import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageFlow } from "../../components/PageFlow";
import { supabase } from "../../lib/supabase"; // mantenha o mesmo import que já funciona aí

export default function VerificarEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(60);

  const { width } = useWindowDimensions();
  const larguraLogo = Math.min(width * 0.3, 120);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function confirmar(valor: string) {
    if (carregando || valor.length !== 6) return;
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: valor,
      type: "signup",
    });

    setCarregando(false);

    if (error) {
      console.log(error.message);
      setErro("Código incorreto ou vencido. Confira o e-mail ou peça um novo código.");
      return;
    }

    router.replace("/auth/tela_preferencias");
  }

  async function reenviar() {
    if (espera > 0) return;
    setErro("");
    setAviso("");

    const { error } = await supabase.auth.resend({ type: "signup", email });

    if (error) {
      console.log(error.message);
      setErro("Não foi possível reenviar agora. Tente de novo em instantes.");
      return;
    }

    setAviso("Enviamos um novo código.");
    setEspera(60);
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
              <Text style={styles.titulo}>Confirme seu e-mail</Text>
              <Text style={styles.subtitulo}>Digite o código que enviamos para você</Text>
            </View>

            <Image
              source={require("../../assets/Lume/Mimi/Png/mimi-pra-esquerda.png")} // mantenha o caminho que já funciona aí
              style={[styles.logo, { width: larguraLogo, height: larguraLogo * (200 / 140) }]}
            />
          </View>

          <Text style={styles.textoEmail}>
            Enviamos 6 números para {email}. Olhe também a caixa de spam.
          </Text>

          {/*CÓDIGO*/}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="000000"
              placeholderTextColor="#9E9E9E"
              value={codigo}
              onChangeText={(t) => {
                const so = t.replace(/\D/g, "").slice(0, 6);
                setCodigo(so);
                if (so.length === 6) confirmar(so);
              }}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              style={styles.inputCodigo}
            />
          </View>

          {erro !== "" && <Text style={styles.erro}>{erro}</Text>}
          {aviso !== "" && <Text style={styles.aviso}>{aviso}</Text>}

          {/*BOTÃO CONFIRMAR*/}
          <TouchableOpacity
            onPress={() => confirmar(codigo)}
            disabled={carregando || codigo.length !== 6}
            style={[styles.botao, (carregando || codigo.length !== 6) && { opacity: 0.6 }]}
          >
            <Text style={styles.botaoTexto}>{carregando ? "Confirmando..." : "Confirmar"}</Text>
          </TouchableOpacity>

          {/*REENVIAR*/}
          <TouchableOpacity onPress={reenviar} disabled={espera > 0}>
            <Text style={[styles.linkEscuro, espera > 0 && { opacity: 0.5 }]}>
              {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
            </Text>
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
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  subtitulo: {
    marginTop: 8,
    color: "#303030",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },

  textoEmail: {
    color: "#303030",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 20,
  },

  inputContainer: {
    backgroundColor: "#F0EEF2",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#D9A8F7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  inputCodigo: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    paddingVertical: 16,
    color: "#303030",
    fontSize: 30,
    letterSpacing: 8,
    textAlign: "center",
    fontFamily: "Poppins_800ExtraBold",
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

  linkEscuro: {
    color: "#303030",
    fontSize: 17,
    textAlign: "center",
    textDecorationLine: "underline",
    fontFamily: "Poppins_600SemiBold",
  },

  erro: {
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  aviso: {
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});