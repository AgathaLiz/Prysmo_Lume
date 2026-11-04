import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { supabase } from "../../lib/supabase"; // mesmo import da verificar_email

export default function RedefinirSenhaScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [codigoConfirmado, setCodigoConfirmado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(60);
  const [concluido, setConcluido] = useState(false);

  const { width } = useWindowDimensions();
  const larguraLogo = Math.min(width * 0.3, 120);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function salvar() {
    if (carregando) return;
    setErro("");
    setAviso("");

    if (!codigoConfirmado && codigo.length !== 6) {
      setErro("Digite o código de 6 números que chegou no e-mail");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter no mínimo 6 caracteres");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas são diferentes");
      return;
    }

    setCarregando(true);

    // 1) confirma o código (isso cria uma sessão temporária de recuperação)
    if (!codigoConfirmado) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: codigo,
        type: "recovery",
      });

      if (error) {
        console.log(error.message);
        setCarregando(false);
        setErro("Código incorreto ou vencido. Confira o e-mail ou peça um novo código.");
        return;
      }
      setCodigoConfirmado(true);
    }

    // 2) salva a senha nova
    const { error: erroSenha } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (erroSenha) {
      console.log(erroSenha.message);
      setErro(
        erroSenha.message.toLowerCase().includes("different")
          ? "A nova senha precisa ser diferente da anterior."
          : "Não foi possível salvar a nova senha. Tente novamente."
      );
      return;
    }

    // 3) sai da sessão de recuperação para a pessoa entrar pelo login normal
    await supabase.auth.signOut();
    setConcluido(true);
  }

  async function reenviar() {
    if (espera > 0 || !email) return;
    setErro("");
    setAviso("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.log(error.message);
      setErro("Não foi possível reenviar agora. Tente de novo em instantes.");
      return;
    }

    setAviso("Se o e-mail tiver uma conta, enviamos um novo código.");
    setEspera(60);
  }

  // Tela de sucesso
  if (concluido) {
    return (
      <View style={[styles.scroll, { flex: 1, backgroundColor: "#E9B8FF" }]}>
        <View style={styles.conteudo}>
          <Text style={[styles.titulo, { textAlign: "center", marginBottom: 12 }]}>Senha alterada!</Text>
          <Text style={[styles.textoEmail, { textAlign: "center" }]}>
            Agora entre com a sua nova senha.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/auth/login/login" as any)} // ajuste se a rota do login for outra
            style={styles.botao}
          >
            <Text style={styles.botaoTexto}>Ir para o login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
              <Text style={styles.titulo}>{"Crie uma\nsenha nova"}</Text>
              <Text style={styles.subtitulo}>Digite o código e escolha a nova senha</Text>
            </View>

            <Image
              source={require("../../assets/Lume/Mimi/Png/mimi-pra-esquerda.png")} // mantenha o caminho que funciona
              style={[styles.logo, { width: larguraLogo, height: larguraLogo * (200 / 140) }]}
            />
          </View>

          <Text style={styles.textoEmail}>
            {email
              ? `Se ${email} tiver uma conta, enviamos 6 números para esse e-mail. Olhe também a caixa de spam.`
              : "Volte e peça o código novamente."}
          </Text>

          {/*CÓDIGO*/}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="000000"
              placeholderTextColor="#9E9E9E"
              value={codigo}
              onChangeText={(t) => setCodigo(t.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              editable={!codigoConfirmado}
              style={styles.inputCodigo}
            />
          </View>

          {/*SENHA NOVA*/}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nova senha"
              placeholderTextColor="#303030"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              {mostrarSenha ? (
                <EyeOff size={22} color="#303030" />
              ) : (
                <Eye size={22} color="#303030" />
              )}
            </TouchableOpacity>
          </View>

          {/*CONFIRMAR SENHA*/}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Repita a nova senha"
              placeholderTextColor="#303030"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {erro !== "" && <Text style={styles.erro}>{erro}</Text>}
          {aviso !== "" && <Text style={styles.aviso}>{aviso}</Text>}

          {/*BOTÃO SALVAR*/}
          <TouchableOpacity
            onPress={salvar}
            disabled={carregando}
            style={[styles.botao, carregando && { opacity: 0.6 }]}
          >
            <Text style={styles.botaoTexto}>{carregando ? "Salvando..." : "Salvar senha"}</Text>
          </TouchableOpacity>

          {/*REENVIAR*/}
          <TouchableOpacity onPress={reenviar} disabled={espera > 0}>
            <Text style={[styles.linkEscuro, espera > 0 && { opacity: 0.5 }]}>
              {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
            </Text>
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

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },

  inputCodigo: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    paddingVertical: 16,
    color: "#303030",
    fontSize: 28,
    letterSpacing: 6,
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