import { PageFlow } from "@/components/PageFlow";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { router } from "expo-router";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";


export default function TelaPreferencias() {
    const [modoEscuro, setModoEscuro] = useState(false);
    const [audioDescricao, setAudioDescricao] = useState(false);
    const [tamanhoFonte, setTamanhoFonte] = useState<"P" | "M" | "G">("M");
    const [dropdownAberto, setDropdownAberto] = useState(false);

    const tamanhosPx = {P: "24px." , M:"30px.", G:"40px."};

    function salvarPreferencias() {
        console.log({modoEscuro, audioDescricao, tamanhoFonte});
    }

  return (
    <View style={styles.container}>

        <Text style={styles.tituloPrincipal}>
          Preferências
        </Text>

        <Text style={styles.textosMenores}>Personalize para seu maior conforto</Text>
          
          {/*caixa de acessibilidade*/}
        <View style={styles.acessibilidadeBox}>
            <View style={styles.linhaPreferencia}>
                <Text style={styles.labelPreferencia}>MODO ESCURO</Text>
                <Switch
                value={modoEscuro}
                onValueChange={setModoEscuro}
                trackColor={{ false: "#d9d9d9", true: "#b5b5b5"}}
                thumbColor={"#FFFFFF"}></Switch>
            </View>

         <View style={styles.linhaPreferencia}>
          <Text style={styles.labelPreferencia}>ÁUDIO DESCRIÇÃO</Text>
          <Switch
            value={audioDescricao}
            onValueChange={setAudioDescricao}
            trackColor={{ false: "#D9D9D9", true: "#B5B5B5" }}
            thumbColor="#FFFFFF"
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

          <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownAberto(!dropdownAberto)}>
            <Text style={styles.dropdownTexto}>{tamanhosPx[tamanhoFonte]}</Text>
            <MaterialCommunityIcons name={dropdownAberto ? "chevron-up" : "chevron-down"} size={20} color="#848080"></MaterialCommunityIcons>
          </TouchableOpacity>
        </View>

        {/* Botão Salvar*/}
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarPreferencias}>
          <Text style={styles.textoSalvar}>Salvar</Text>
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
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 50,
    color: "#8A8080",
  },

  tituloPrincipal: {
    fontSize: 30, 
    color: "#8A8080", 
    fontWeight: "bold", 
  },

  textosMenores: {
    color: "#8A8080",
    marginBottom: 10,
    fontSize: 15,
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
    color: "#8A8080",
    fontWeight: "600",
    fontSize: 14,
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
    color: "#8A8080",
    fontWeight: "bold",
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
    backgroundColor: "#EDEDED",
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
    backgroundColor: "#D9D9D9",
    
  },

  letraFontePequena: {
    fontSize: 24,
    color: "#8A8080",
    fontWeight: "bold",
  },

  letraFonteMedia: {
    fontSize: 30,
    color: "#8A8080",
    fontWeight: "bold",
  },

  letraFonteGrande: {
    fontSize: 40,
    color: "#8A8080",
    fontWeight: "bold",
  },

  legendaFonte: {
    fontSize: 14,
    color: "#8A8080",
    marginTop: 4,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  dropdownTexto: {
    color: "#8A8080",
    fontSize: 13,
  },

  botaoSalvar: {
    width: "90%",
    marginTop: 30,
    backgroundColor: "#D9D9D9",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    
  },

  textoSalvar: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8A8080",
  },
});