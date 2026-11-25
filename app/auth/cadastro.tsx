import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { GuiaMimi, useAlvoGuia } from "../../components/GuiaMimi";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "../../lib/primeiro-acesso";
import { PageFlow } from "../../components/PageFlow";

const PASSOS_CADASTRO = [
  "Toque aqui e digite o seu nome completo.",
  "Agora toque aqui e coloque a sua data de nascimento.",
  "Digite aqui o número do seu celular com DDD.",
  "Agora toque aqui e digite o seu e-mail.",
  "Crie uma senha com pelo menos 6 letras ou números.",
  "Digite a mesma senha mais uma vez para confirmar.",
  "Tudo preenchido! Agora toque aqui em Cadastrar para continuar.",
];

//import do subase
import { supabase } from "../../lib/supabase";

// nomes dos objetos que vão guardar as informações
export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erros, setErros] = useState({
  nome: "",
  nascimento: "",
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
});
  const [guiaAtivo, setGuiaAtivo] = useState(false);
  const [passoGuia, setPassoGuia] = useState(0);
  const [campoEmFoco, setCampoEmFoco] = useState(false);

  const refNome = useRef<View>(null);
  const refNascimento = useRef<View>(null);
  const refTelefone = useRef<View>(null);
  const refEmail = useRef<View>(null);
  const refSenha = useRef<View>(null);
  const refConfirmar = useRef<View>(null);
  const refBotao = useRef<View>(null);
  const refsGuia = useMemo(
    () => [refNome, refNascimento, refTelefone, refEmail, refSenha, refConfirmar, refBotao],
    []
  );
  const { alvo: alvoGuia, remedir: remedirGuia } = useAlvoGuia(guiaAtivo, passoGuia, refsGuia);

  useEffect(() => {
    let ativo = true;
    deveMostrarGuiaTela("cadastro").then((mostrar) => {
      if (ativo && mostrar) setGuiaAtivo(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

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
  const { data, error } = await supabase.auth.signUp({
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

  // Se o e-mail já tem conta, o Supabase não dá erro: devolve identities vazio
if (data.user && data.user.identities?.length === 0) {
  setErros({ ...novosErros, email: "Este e-mail já tem uma conta. Tente entrar." });
  return;
}

router.replace({
  pathname: "/auth/verificar_email",
  params: { email: email.trim() },
});
}

  return (
    <View style={styles.container}>
    <TouchableOpacity
      style={[styles.botaoVoltarTopo, { top: insets.top + 10 }]}
      onPress={() => router.push("../auth/login/contas")}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <ArrowLeft size={26} color="#303030" strokeWidth={2.5} />
    </TouchableOpacity>

    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 68, paddingBottom: 96 },
      ]}
      keyboardShouldPersistTaps="handled"
      onScroll={remedirGuia}
      scrollEventThrottle={32}
      onScrollEndDrag={remedirGuia}
      onMomentumScrollEnd={remedirGuia}
    >
      {/* mascote + Balão */}
      <View style={styles.topContainer}>
        <View style={styles.photoWrapper}>
          <Image
            source={require("../../assets/Lume/Mimi/Png/mimi-ensinando.png")}
            style={styles.photoBox}
            resizeMode="contain"
          />
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Insira seus dados pessoais para criar uma nova conta
          </Text>
        </View>
      </View>

{/* Campos para preencher do formulário */}
      <View style={styles.row}>
      <View ref={refNome} collapsable={false} style={[styles.inputWrapper, styles.halfInput]}>
    <User size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Nome"
      placeholderTextColor="#303030"
      value={nome}
      onChangeText={setNome}
      onFocus={() => setCampoEmFoco(true)}
      onBlur={() => setCampoEmFoco(false)}
      style={[styles.input, styles.inputWithIcon]}
    />
    {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null} {/* O if verificou que o campo não foi preenchido essa mensagem de erro aparece */}
  </View>

  <View ref={refNascimento} collapsable={false} style={[styles.inputWrapper, styles.halfInput]}>
    <Calendar size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Nascimento"
      placeholderTextColor="#303030"
      value={nascimento}
      keyboardType="numeric"
      maxLength={10}
      onChangeText={(texto) => setNascimento(mascaraData(texto))}
      onFocus={() => setCampoEmFoco(true)}
      onBlur={() => setCampoEmFoco(false)}
      style={[styles.input, styles.inputWithIcon]}
    />
    {erros.nascimento ? (
      <Text style={styles.errorText}>{erros.nascimento}</Text>
    ) : null}
  </View>
</View>

<View ref={refTelefone} collapsable={false} style={styles.inputWrapper}>
  <Phone size={20} color="#303030" style={styles.icon} />
  <TextInput
    placeholder="Telefone"
    placeholderTextColor="#303030"
    value={telefone}
    keyboardType="phone-pad"
    maxLength={15}
    onChangeText={(texto) => setTelefone(mascaraTelefone(texto))}
    onFocus={() => setCampoEmFoco(true)}
    onBlur={() => setCampoEmFoco(false)}
    style={[styles.input, styles.inputWithIcon]}
  />
  {erros.telefone ? (
    <Text style={styles.errorText}>{erros.telefone}</Text>
  ) : null}
</View>

<View ref={refEmail} collapsable={false} style={styles.inputWrapper}>
  <Mail size={20} color="#303030" style={styles.icon} />
  <TextInput
    placeholder="E-mail"
    placeholderTextColor="#303030"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    autoCapitalize="none"
    onFocus={() => setCampoEmFoco(true)}
    onBlur={() => setCampoEmFoco(false)}
    style={[styles.input, styles.inputWithIcon]}
  />
  {erros.email ? <Text style={styles.errorText}>{erros.email}</Text> : null}
</View>

  <View style={styles.row}>
  <View ref={refSenha} collapsable={false} style={[styles.inputWrapper, styles.halfInput]}>
    <Lock size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Criar senha"
      placeholderTextColor="#5A535E"
      secureTextEntry={!mostrarSenha}
      value={senha}
      onChangeText={setSenha}
      autoCapitalize="none"
      onFocus={() => setCampoEmFoco(true)}
      onBlur={() => setCampoEmFoco(false)}
      style={[styles.input, styles.inputWithIcon, styles.inputWithEye]}
    />
    <TouchableOpacity
      style={styles.eyeButton}
      onPress={() => setMostrarSenha(!mostrarSenha)}
      accessibilityRole="button"
      accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
    >
      {mostrarSenha ? (
        <EyeOff size={20} color="#303030" />
      ) : (
        <Eye size={20} color="#303030" />
      )}
    </TouchableOpacity>
    {erros.senha ? <Text style={styles.errorText}>{erros.senha}</Text> : null}
  </View>

  <View ref={refConfirmar} collapsable={false} style={[styles.inputWrapper, styles.halfInput]}>
    <Lock size={20} color="#303030" style={styles.icon} />
    <TextInput
      placeholder="Repetir senha"
      placeholderTextColor="#5A535E"
      secureTextEntry={!mostrarConfirmarSenha}
      value={confirmarSenha}
      onChangeText={setConfirmarSenha}
      autoCapitalize="none"
      onFocus={() => setCampoEmFoco(true)}
      onBlur={() => setCampoEmFoco(false)}
      style={[styles.input, styles.inputWithIcon, styles.inputWithEye]}
    />
    <TouchableOpacity
      style={styles.eyeButton}
      onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
      accessibilityRole="button"
      accessibilityLabel={
        mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"
      }
    >
      {mostrarConfirmarSenha ? (
        <EyeOff size={20} color="#303030" />
      ) : (
        <Eye size={20} color="#303030" />
      )}
    </TouchableOpacity>
    {erros.confirmarSenha ? (
      <Text style={styles.errorText}>{erros.confirmarSenha}</Text>
    ) : null}
  </View>
  </View>

  {/* Erro geral do cadastro */}
  {erroGeral ? <Text style={styles.errorText}>{erroGeral}</Text> : null}

  {/* Botão que conclui o cadastro */}
  <View ref={refBotao} collapsable={false}>
    <TouchableOpacity
      style={[styles.button, carregando && { opacity: 0.6 }]}
      onPress={cadastrarUsuario}
      disabled={carregando}
    >
      <Text style={styles.buttonText}>{carregando ? "Criando..." : "Cadastrar"}</Text>
    </TouchableOpacity>
  </View>
      
    </ScrollView>

    <PageFlow total={4} currentIndex={1} />

    <GuiaMimi
      visivel={guiaAtivo && !campoEmFoco}
      alvo={alvoGuia}
      texto={PASSOS_CADASTRO[passoGuia]}
      passoAtual={passoGuia + 1}
      totalPassos={PASSOS_CADASTRO.length}
      textoBotaoPrincipal={passoGuia === PASSOS_CADASTRO.length - 1 ? "Entendi" : "Próximo"}
      aoPressionarPrincipal={() => {
        if (passoGuia < PASSOS_CADASTRO.length - 1) {
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

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  photoWrapper: {
    width: 112,
    height: 156,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  photoBox: {
    width: 104,
    height: 148,
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
    backgroundColor: "#F0EEF2",
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#D9A8F7",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 17,
    fontFamily:"Poppins_600SemiBold",
    color:"#303030",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null),
  },

  halfInput: {
    width: "48%",
  },

  button: {
    marginTop: 18,
    marginBottom: 4,
    backgroundColor: "#D689FF",
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
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

inputWithEye: {
  paddingRight: 44,
},

eyeButton: {
  position: "absolute",
  right: 8,
  top: 11,
  padding: 10,
  zIndex: 1,
},

});