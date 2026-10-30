import { ChevronRight, HelpCircle, Info, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const MIMI = require("../../assets/Lume/Mimi/Png/mimi-de-frente.png");

const PERGUNTAS = [
  {
    titulo: "Como funciona?",
    resposta:
      "Cada lição tem um vídeo curto, perguntas e uma simulação. Você aprende no seu ritmo e pode repetir quantas vezes quiser.",
  },
  {
    titulo: "O que é ofensiva?",
    resposta:
      "A ofensiva são os dias seguidos em que você faz pelo menos uma lição. Acender a luz todos os dias mantém sua sequência.",
  },
  {
    titulo: "O que posso aprender?",
    resposta:
      "Você aprende a usar o celular no dia a dia: contatos, mensagens, chamadas, fotos, segurança e muito mais.",
  },
  {
    titulo: "O que é Xp?",
    resposta:
      "Xp é a pontuação que você ganha ao concluir lições. Quanto mais Xp, mais perto do próximo nível você fica.",
  },
];

export default function TelaAjuda() {
  const insets = useSafeAreaInsets();
  const { tema, modoEscuro, fonte } = useAcessibilidade();
  const [aberta, setAberta] = useState<string | null>(null);

  const fundo = modoEscuro ? tema.fundo : "#F8F4FC";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const borda = modoEscuro ? tema.borda : "#DFC3F5";
  const perguntaAberta = PERGUNTAS.find((item) => item.titulo === aberta);

  const falarConosco = async () => {
    const endereco =
      "mailto:contato@lume.app?subject=Ajuda%20com%20o%20Lume&body=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com...";
    try {
      const suporta = await Linking.canOpenURL(endereco);
      if (suporta) {
        await Linking.openURL(endereco);
      } else {
        Alert.alert("Fale conosco", "Envie um e-mail para contato@lume.app");
      }
    } catch {
      Alert.alert("Fale conosco", "Envie um e-mail para contato@lume.app");
    }
  };

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <View style={styles.topo}>
          <BotaoVoltar />
          <Image source={MIMI} style={styles.mimi} resizeMode="contain" />
        </View>

        <View
          style={[
            styles.cartaoAjuda,
            { backgroundColor: cartao, borderColor: borda, marginTop: -48 },
          ]}
        >
          <Text style={[styles.tituloCartao, { color: texto, fontSize: fonte(23) }]}>
            Como Funciona?
          </Text>
          <Text style={[styles.ajudaCartao, { color: secundario, fontSize: fonte(13) }]}>
            Toque em uma pergunta para ver a resposta.
          </Text>

          <View style={styles.linhaChips}>
            {PERGUNTAS.map((pergunta) => {
              const ativa = aberta === pergunta.titulo;
              return (
                <Pressable
                  key={pergunta.titulo}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: ativa
                        ? tema.roxo
                        : modoEscuro
                        ? "#3D2A46"
                        : "#F3ECF8",
                      borderColor: ativa ? tema.roxoEscuro : "transparent",
                    },
                  ]}
                  onPress={() => setAberta(ativa ? null : pergunta.titulo)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativa }}
                  accessibilityLabel={pergunta.titulo}
                >
                  <Text
                    style={[
                      styles.textoChip,
                      {
                        color: ativa ? "#2C1038" : texto,
                        fontSize: fonte(13),
                      },
                    ]}
                  >
                    {pergunta.titulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {perguntaAberta ? (
            <View style={[styles.resposta, { backgroundColor: modoEscuro ? "#3D2A46" : "#FBF7FE" }]}>
              <Text style={[styles.textoResposta, { color: texto, fontSize: fonte(14) }]}>
                {perguntaAberta.resposta}
              </Text>
            </View>
          ) : null}
        </View>

        <BotaoAjuda
          icone={<HelpCircle size={24} color="#2C1038" />}
          titulo="FAQ"
          onPress={() =>
            Alert.alert(
              "Perguntas frequentes",
              "Como funciona?\nO que é ofensiva?\nO que posso aprender?\nO que é Xp?\n\nToque nos botões acima para ver cada resposta."
            )
          }
        />
        <BotaoAjuda
          icone={<Mail size={24} color="#2C1038" />}
          titulo="Fale Conosco"
          onPress={() => void falarConosco()}
        />
        <BotaoAjuda
          icone={<Info size={24} color="#2C1038" />}
          titulo="Sobre Nós"
          onPress={() =>
            Alert.alert(
              "Sobre o Lume",
              "O Lume é um aplicativo feito para ajudar pessoas a aprenderem a usar o celular com mais autonomia, segurança e carinho."
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function BotaoAjuda({
  icone,
  titulo,
  onPress,
}: {
  icone: React.ReactNode;
  titulo: string;
  onPress: () => void;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.botaoAjuda,
        { backgroundColor: tema.roxo, opacity: pressed ? 0.84 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={styles.iconeBotao}>{icone}</View>
      <Text style={[styles.textoBotaoAjuda, { fontSize: fonte(18) }]}>{titulo}</Text>
      <ChevronRight size={25} color="#2C1038" strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  topo: {
    minHeight: 210,
    justifyContent: "flex-start",
  },
  mimi: {
    position: "absolute",
    right: -8,
    top: 26,
    width: 174,
    height: 174,
  },
  cartaoAjuda: {
    borderRadius: 28,
    borderWidth: 3,
    padding: 18,
    marginRight: 32,
    shadowColor: "#4B2A60",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tituloCartao: {
    fontFamily: "Poppins_900Black",
  },
  ajudaCartao: {
    fontFamily: "Poppins_300Light",
    marginTop: 2,
  },
  linhaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textoChip: {
    fontFamily: "Poppins_600SemiBold",
  },
  resposta: {
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
  },
  textoResposta: {
    fontFamily: "Poppins_300Light",
    lineHeight: 20,
  },
  botaoAjuda: {
    marginTop: 12,
    minHeight: 64,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconeBotao: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoAjuda: {
    flex: 1,
    fontFamily: "Poppins_900Black",
    color: "#2C1038",
  },
});
