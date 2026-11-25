import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GuiaMimi, useAlvoGuia } from "../../../components/GuiaMimi";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "../../../lib/primeiro-acesso";
import { PageFlow } from "../../../components/PageFlow";

const PASSOS_LOGIN = [
  "Toque aqui e digite o e-mail da sua conta Lume.",
  "Agora toque aqui e digite a sua senha.",
  "Tudo certo! Toque aqui em Entrar para acessar o aplicativo.",
];

//import supabase
import { supabase } from "../../../lib/supabase";



export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroLogin, setErroLogin] = useState("");const [continuarConectado, setContinuarConectado] = useState(false);
  const [guiaAtivo, setGuiaAtivo] = useState(false);
  const [passoGuia, setPassoGuia] = useState(0);
  const [campoEmFoco, setCampoEmFoco] = useState(false);

  const refEmail = useRef<View>(null);
  const refSenha = useRef<View>(null);
  const refEntrar = useRef<View>(null);
  const refsGuia = useMemo(() => [refEmail, refSenha, refEntrar], []);
  const { alvo: alvoGuia, remedir: remedirGuia } = useAlvoGuia(guiaAtivo, passoGuia, refsGuia);

  useEffect(() => {
    let ativo = true;
    deveMostrarGuiaTela("login").then((mostrar) => {
      if (ativo && mostrar) setGuiaAtivo(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function Login() {
  if (carregando) return;
  setErroLogin("");

  if (!email.trim() || !senha) {
    setErroLogin("Preencha e-mail e senha");
    return;
  }

  setCarregando(true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error || !data.user) {
    setCarregando(false);
    console.log(error?.message);

     if (
    error?.code === "email_not_confirmed" ||
    error?.message.toLowerCase().includes("email not confirmed")
  ) {
    await supabase.auth.resend({ type: "signup", email: email.trim() });
    router.push({
      pathname: "/auth/verificar_email",
      params: { email: email.trim() },
    });
    return;
  }

    if (error?.message.toLowerCase().includes("invalid login")) {
      setErroLogin("E-mail ou senha incorretos");
    } else {
      setErroLogin("Não foi possível entrar. Verifique sua conexão e tente novamente.");
    }
    return;
  }

  // Descobre o papel da pessoa que acabou de entrar
  const { data: perfil, error: erroPerfil } = await supabase
    .from("usuario")
    .select("papel")
    .eq("auth_user_id", data.user.id)
    .single();

  setCarregando(false);

  if (erroPerfil) {
    console.log(erroPerfil.message);
    setErroLogin("Não foi possível carregar seu perfil. Tente novamente.");
    return;
  }

  if (perfil.papel === "admin") {
    // O administrador tem a área dele (perfil, permissões e criação de lição).
    router.replace("/admin" as any);
  } else {
    // Já tem conta: vai direto para o bem-vindo 
    router.replace("/onboarding/bem_vindo" as any);
  }
}

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.botaoVoltarTopo, { top: insets.top + 10 }]}
        onPress={() => router.push("../login/contas")}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft size={26} color="#303030" strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: insets.top + 70, paddingBottom: 96 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={remedirGuia}
        scrollEventThrottle={32}
        onScrollEndDrag={remedirGuia}
        onMomentumScrollEnd={remedirGuia}
      >
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

      {/*EMAIL*/}

      <View ref={refEmail} collapsable={false} style={styles.inputContainer}>
        <Mail size={22} color="#303030" style={styles.iconeCampo} />
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#5A535E"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setCampoEmFoco(true)}
          onBlur={() => setCampoEmFoco(false)}
          style={styles.input}
        />
      </View>
      
      {/*SENHA*/}

      <View ref={refSenha} collapsable={false} style={styles.senhaContainer}>
        <Lock size={22} color="#303030" style={styles.iconeCampo} />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#5A535E"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          onFocus={() => setCampoEmFoco(true)}
          onBlur={() => setCampoEmFoco(false)}
          style={styles.senhaInput}
        />

        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            {mostrarSenha ? (
              <EyeOff size={22} color="#303030" />
              ) : (
              <Eye size={22} color="#303030" />
            )}
        </TouchableOpacity>
      </View>

      
        {erroLogin !== "" &&(
          <Text style={styles.erro}>{erroLogin}</Text>
        )}


      <View style={styles.links}>
        <TouchableOpacity
          style={styles.continuarConectadoRow}
          onPress={() => setContinuarConectado(!continuarConectado)}
        >
          <View
            style={[
              styles.continuarConectadoBox,
              continuarConectado && styles.continuarConectadoAtivo,
            ]}
          />
          <Text style={styles.continuarConectadoTexto}>Continuar conectado?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("../cadastro")}>
          <Text style={styles.linkEscuro}>Criar conta?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.esqueciLinha}
        onPress={() => router.push("/auth/esqueci_senha" as any)}
      >
        <Text style={styles.linkEsqueci}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      {/*BOTÃO LOGIN*/}

      <View ref={refEntrar} collapsable={false}>
        <TouchableOpacity
          onPress={Login}
          disabled={carregando}
          style={[styles.botao, carregando && { opacity: 0.6 }]}
          >
          <Text style={styles.botaoTexto}>{carregando ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>
      </View>

      </ScrollView>

      <PageFlow total={4} currentIndex={1} />

      <GuiaMimi
        visivel={guiaAtivo && !campoEmFoco}
        alvo={alvoGuia}
        texto={PASSOS_LOGIN[passoGuia]}
        passoAtual={passoGuia + 1}
        totalPassos={PASSOS_LOGIN.length}
        textoBotaoPrincipal={passoGuia === PASSOS_LOGIN.length - 1 ? "Entendi" : "Próximo"}
        aoPressionarPrincipal={() => {
          if (passoGuia < PASSOS_LOGIN.length - 1) {
            setPassoGuia((p) => p + 1);
          } else {
            setGuiaAtivo(false);
          }
        }}
        aoPressionarSecundario={() => {
          setGuiaAtivo(false);
          void concluirFluxoEssencial();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  botaoVoltarTopo: {
    position: "absolute",
    left: 20,
    zIndex: 5,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5B4FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
  },

  rolagem: {
    flex: 1,
  },

  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  

  logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 35,
  },

  textoContainer: {
    flex: 1,
    minWidth: 0,
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
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null),
  },

  inputContainer: {
    backgroundColor: "#F0EEF2",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D8D2DC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 15,
    maxWidth: "100%",
    overflow: "hidden",
  },
  iconeCampo: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null),
  },

  senhaContainer: {
    backgroundColor: "#F0EEF2",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D8D2DC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    maxWidth: "100%",
    overflow: "hidden",
  },

  senhaInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    color: "#303030",
    fontSize: 18,
    fontFamily:"Poppins_600SemiBold",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null),
    
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  esqueciLinha: {
    alignSelf: "flex-start",
    marginBottom: 24,
    paddingVertical: 4,
  },
  linkEsqueci: {
    color: "#6D1E96",
    fontSize: 19,
    fontFamily: "Poppins_800ExtraBold",
    textDecorationLine: "underline",
  },

  continuarConectadoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  continuarConectadoBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D689FF",
    marginRight: 8,
  },

  continuarConectadoAtivo: {
    backgroundColor: "#303030",
    borderColor: "#D689FF",
    borderWidth: 4,
  },

    continuarConectadoTexto: {
    color: "#303030",
    fontSize: 16,
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
    fontSize: 16,
    fontFamily:"Poppins_800ExtraBold",
  },

  botao: {
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 8,
    backgroundColor: "#D689FF",
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