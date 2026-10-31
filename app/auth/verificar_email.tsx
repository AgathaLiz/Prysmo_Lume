import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase"; // mesmo import do cadastro

export default function VerificarEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(60);

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
    <View style={styles.container}>
      {/* Botão para voltar */}
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <ChevronLeft size={25} color="#303030" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <View style={styles.textoContainer}>
          <Text style={styles.titulo}>Confirme seu e-mail</Text>
          <Text style={styles.subtitulo}>Digite o código que enviamos para você</Text>
        </View>

        <Image
          source={require("../../assets/Lume/Mimi/Png/mimi-pra-esquerda.png")}
          style={styles.logo}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    paddingBottom: 80,
    backgroundColor: "#E9B8FF",
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

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
    fontFamily: "Poppins_600SemiBold",
  },

  textoEmail: {
    color: "#303030",
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 20,
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

  inputCodigo: {
    flex: 1,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 32,
    letterSpacing: 8,
    textAlign: "center",
    fontFamily: "Poppins_800ExtraBold",
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