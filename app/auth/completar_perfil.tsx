import { router } from "expo-router";
import { ArrowLeft, Calendar, Phone, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageFlow } from "../../components/PageFlow";
import { supabase } from "../../lib/supabase";

export default function CompletarPerfilScreen() {
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erros, setErros] = useState({ nome: "", nascimento: "", telefone: "" });
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  // Preenche o nome com o que o Google/Facebook enviou
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      const nomeSocial = meta?.full_name || meta?.name || "";
      if (nomeSocial) setNome(nomeSocial);
    });
  }, []);

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

  function formatarData(data: string) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  function dataValida(valor: string) {
    const [d, m, a] = valor.split("/").map(Number);
    if (!d || !m || !a || a < 1900) return false;
    const dt = new Date(a, m - 1, d);
    return (
      dt.getFullYear() === a &&
      dt.getMonth() === m - 1 &&
      dt.getDate() === d &&
      dt <= new Date()
    );
  }

  async function salvarPerfil() {
    if (carregando) return;
    setErroGeral("");

    const novosErros = { nome: "", nascimento: "", telefone: "" };
    if (!nome.trim()) novosErros.nome = "Preencha o nome";
    if (!dataValida(nascimento)) novosErros.nascimento = "Data inválida";
    if (telefone.replace(/\D/g, "").length < 10) novosErros.telefone = "Telefone inválido";

    setErros(novosErros);
    if (Object.values(novosErros).some((e) => e !== "")) return;

    setCarregando(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCarregando(false);
      router.replace("/auth/login/contas" as any);
      return;
    }

    const { error } = await supabase.from("usuario").insert({
      auth_user_id: user.id,
      nome_completo: nome.trim(),
      telefone,
      data_nascimento: formatarData(nascimento),
    });

    setCarregando(false);

    if (error) {
      console.log(error.message);
      if (error.code === "23505") {
        setErroGeral("Esse telefone já está cadastrado em outra conta.");
      } else {
        setErroGeral("Não foi possível salvar seus dados. Tente novamente.");
      }
      return;
    }

    router.replace("/auth/tela_preferencias" as any);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.botaoVoltarTopo, { top: insets.top + 10 }]}
        onPress={() => router.replace("/auth/login/contas" as any)}
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
      >
        <View style={styles.topContainer}>
          <Image
            source={require("../../assets/Lume/Mimi/Png/mimi-ensinando.png")}
            style={styles.photoBox}
            resizeMode="contain"
          />
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              Falta pouco! Complete seus dados para continuar.
            </Text>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <User size={20} color="#303030" style={styles.icon} />
          <TextInput
            placeholder="Nome"
            placeholderTextColor="#5A535E"
            value={nome}
            onChangeText={setNome}
            style={[styles.input, styles.inputWithIcon]}
          />
          {erros.nome ? <Text style={styles.errorText}>{erros.nome}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#303030" style={styles.icon} />
          <TextInput
            placeholder="Nascimento"
            placeholderTextColor="#5A535E"
            value={nascimento}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(t) => setNascimento(mascaraData(t))}
            style={[styles.input, styles.inputWithIcon]}
          />
          {erros.nascimento ? <Text style={styles.errorText}>{erros.nascimento}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <Phone size={20} color="#303030" style={styles.icon} />
          <TextInput
            placeholder="Telefone"
            placeholderTextColor="#5A535E"
            value={telefone}
            keyboardType="phone-pad"
            maxLength={15}
            onChangeText={(t) => setTelefone(mascaraTelefone(t))}
            style={[styles.input, styles.inputWithIcon]}
          />
          {erros.telefone ? <Text style={styles.errorText}>{erros.telefone}</Text> : null}
        </View>

        {erroGeral ? <Text style={styles.errorText}>{erroGeral}</Text> : null}

        <TouchableOpacity
          style={[styles.button, carregando && { opacity: 0.6 }]}
          onPress={salvarPerfil}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>{carregando ? "Salvando..." : "Continuar"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <PageFlow total={4} currentIndex={1} />
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
    backgroundColor: "#F0EEF2",
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#D9A8F7",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 17,
    fontFamily:"Poppins_600SemiBold",
    color:"#303030",
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

});