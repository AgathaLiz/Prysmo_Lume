import { PageFlow } from "@/components/PageFlow";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    Image
} from "react-native";

//import do subase
import { supabase } from "../../lib/supabase";


export default function TelaPreferencias() {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [audioDescricao, setAudioDescricao] = useState(false);
  const [tamanhoFonte, setTamanhoFonte] = useState<"P" | "M" | "G">("M");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const tamanhosPx = { P: 24, M: 30, G: 40 };

  // Carrega as preferências já salvas (quem é novo fica com os padrões)
  useEffect(() => {
    async function carregar() {
      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("usuario_id")
        .maybeSingle();

      if (!usuarioData) return;

      const { data } = await supabase
        .from("usuario_acessibilidade_settings")
        .select("tamanho_fonte, modo_escuro, audio_descricao")
        .eq("usuario_id", usuarioData.usuario_id)
        .maybeSingle();

      if (!data) return;

      setModoEscuro(data.modo_escuro);
      setAudioDescricao(data.audio_descricao);
      setTamanhoFonte(
        data.tamanho_fonte <= 24 ? "P" : data.tamanho_fonte >= 40 ? "G" : "M"
      );
    }
    carregar();
  }, []);

  async function salvarPreferencias() {
    if (carregando) return;
    setErro("");
    setCarregando(true);

    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuario")
      .select("usuario_id")
      .maybeSingle();

    if (usuarioError || !usuarioData) {
      setCarregando(false);
      setErro("Não foi possível carregar seu perfil. Entre novamente.");
      return;
    }

    const { error } = await supabase
      .from("usuario_acessibilidade_settings")
      .upsert(
        {
          usuario_id: usuarioData.usuario_id,
          tamanho_fonte: tamanhosPx[tamanhoFonte],
          modo_escuro: modoEscuro,
          audio_descricao: audioDescricao,
        },
        { onConflict: "usuario_id" }
      );

    setCarregando(false);

    if (error) {
      console.log(error.message);
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }

    router.replace("/onboarding/bem_vindo");
  }

  return (
    <View style={styles.container}>
      

        <Text style={styles.tituloPrincipal}>
          Preferências
        </Text>

        
          
          {/*caixa de acessibilidade*/}
        <View style={styles.acessibilidadeBox}>
            <View style={styles.linhaPreferencia}>
                <Text style={styles.labelPreferencia}>MODO ESCURO</Text>
                <Switch
                value={modoEscuro}
                onValueChange={setModoEscuro}
                trackColor={{ false: "#d9d9d9", true: "#FFEB9C"}}
                thumbColor={modoEscuro ? "#303030" : "#303030"}
                ios_backgroundColor="#303030"></Switch>
            </View>

         <View style={styles.linhaPreferencia}>
          <Text style={styles.labelPreferencia}>ÁUDIO DESCRIÇÃO</Text>
          <Switch
            value={audioDescricao}
            onValueChange={setAudioDescricao}
            trackColor={{ false: "#D9D9D9", true: "#FFEB9C" }}
            thumbColor={modoEscuro ? "#303030" : "#303030"}
            ios_backgroundColor="#303030"
          />
        </View>

        </View>

        

            {/*caixa da fonte*/}
        <View style={styles.tamanhoFonteBox}>
          <Text style={styles.tituloCaixa}>Tamanho da Fonte</Text>

          <View style={styles.opcoesFonte}>
            <TouchableOpacity style={[styles.botaoFonte, tamanhoFonte === "P" && styles.botaoFonteAtivo,]}
            onPress={() => setTamanhoFonte("P")}>
              <Text style={styles.letraFontePequena}>A</Text>
              <Text style={styles.legendaFonte}>Pequena</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botaoFonte, tamanhoFonte === "M" && styles.botaoFonteAtivo,]}
            onPress={() => setTamanhoFonte("M")}>
              <Text style={styles.letraFonteMedia}>A</Text>
              <Text style={styles.legendaFonte}>Media</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botaoFonte, tamanhoFonte === "G" && styles.botaoFonteAtivo,]}
            onPress={() => setTamanhoFonte("G")}>
              <Text style={styles.letraFonteGrande}>A</Text>
              <Text style={styles.legendaFonte}>Grande</Text>
            </TouchableOpacity>
          </View>

          
        </View>

        {/* Botão Salvar*/}
        {erro ? <Text style={{ color: "#C04B4B", fontFamily: "Poppins_600SemiBold", marginTop: 20 }}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.botaoSalvar, carregando && { opacity: 0.6 }]}
          onPress={salvarPreferencias}
          disabled={carregando}
        >
          <Text style={styles.textoSalvar}>{carregando ? "Salvando..." : "Salvar"}</Text>
        </TouchableOpacity>
          
         <PageFlow
          total={4}
          currentIndex={2}></PageFlow>
        
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#E9B8FF",
  },

 

  tituloPrincipal: {
    fontSize: 35, 
    color: "#303030", 
    fontFamily: "Poppins_800ExtraBold",
  },

 

   acessibilidadeBox: {
    justifyContent: "space-between",
    marginTop: 30,
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
  },

  linhaPreferencia: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  labelPreferencia: {
    color: "#303030",
    fontFamily:"Poppins_600SemiBold",
    fontSize: 18,
  },

  tamanhoFonteBox: {
    width: "90%",
    justifyContent: "space-between",
    marginTop: 20,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
  },

  tituloCaixa: {
    textAlign: "center",
    color: "#303030",
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 20,
    marginBottom: 14,
  },

  opcoesFonte: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    
  },

  botaoFonte: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    
  },

  botaoFonteAtivo: {
    backgroundColor: "#FFEB9C",
    
  },

  letraFontePequena: {
    fontSize: 24,
    color: "#303030",
    fontFamily:"Poppins_600SemiBold",
  },

  letraFonteMedia: {
    fontSize: 30,
    color: "#303030",
    fontFamily:"Poppins_600SemiBold",
  },

  letraFonteGrande: {
    fontSize: 40,
    color: "#303030",
    fontFamily:"Poppins_600SemiBold",
  },

  legendaFonte: {
    fontSize: 14,
    fontFamily:"Poppins_600SemiBold",
    color: "#303030",
    marginTop: 4,
  },


  botaoSalvar: {
    backgroundColor: "#FFD651",
    marginTop: 50,
    width: 300,
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    
  },

  textoSalvar: {
     textAlign: "center",
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",

  },
});