import {
  Captions,
  Gauge,
  Hand,
  Palette,
  PauseCircle,
  RotateCcw,
  Volume2,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Opcao = {
  chave: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  ativo?: boolean;
  aoTocar: () => void;
};

export default function TelaAcessibilidade() {
  const insets = useSafeAreaInsets();
  const {
    tema,
    modoEscuro,
    fonte,
    audioDescricao,
    reduzirMovimento,
    definirAudioDescricao,
    falar,
    pararFala,
  } = useAcessibilidade();

  const fundo = modoEscuro ? tema.fundo : "#F8F4FC";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const borda = modoEscuro ? tema.borda : "#DFC3F5";

  const avisar = (titulo: string, mensagem: string) => {
    Alert.alert(titulo, mensagem);
  };

  const alternarAudio = async () => {
    const novo = !audioDescricao;
    await definirAudioDescricao(novo);

    if (novo) {
      falar("Áudio descrição ativada. Os textos importantes podem ser ouvidos.");
    } else {
      pararFala();
    }
  };

  const opcoes: Opcao[] = [
    {
      chave: "audio",
      titulo: "Áudio Descrição",
      descricao: audioDescricao ? "Ativado" : "Desativado",
      icone: <Volume2 size={30} color={texto} />,
      ativo: audioDescricao,
      aoTocar: () => void alternarAudio(),
    },
    {
      chave: "animacoes",
      titulo: "Parar Animações",
      descricao: reduzirMovimento ? "Ativado pelo sistema" : "Desativado",
      icone: <PauseCircle size={30} color={texto} />,
      ativo: reduzirMovimento,
      aoTocar: () =>
        avisar(
          "Parar animações",
          "O Lume respeita a opção de reduzir movimento do seu celular. Ative essa opção nas configurações do aparelho."
        ),
    },
    {
      chave: "daltonismo",
      titulo: "Daltonismo",
      descricao: "Cores com contraste",
      icone: <Palette size={30} color={texto} />,
      aoTocar: () =>
        avisar(
          "Daltonismo",
          "As cores do Lume já foram escolhidas pensando em contraste. Em breve teremos filtros extras."
        ),
    },
    {
      chave: "libras",
      titulo: "Libras",
      descricao: "Em breve",
      icone: <Hand size={30} color={texto} />,
      aoTocar: () =>
        avisar("Libras", "Estamos preparando vídeos com tradução em Libras."),
    },
    {
      chave: "legendas",
      titulo: "Legendas",
      descricao: "Em breve",
      icone: <Captions size={30} color={texto} />,
      aoTocar: () =>
        avisar("Legendas", "Em breve os vídeos terão legendas opcionais."),
    },
    {
      chave: "velocidade",
      titulo: "Velocidade do Áudio",
      descricao: "0,9x",
      icone: <Gauge size={30} color={texto} />,
      aoTocar: () =>
        avisar(
          "Velocidade do áudio",
          "A voz do Lume já fala um pouco mais devagar para facilitar o acompanhamento."
        ),
    },
  ];

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <BotaoVoltar />

        <Text style={[styles.titulo, { color: texto, fontSize: fonte(30) }]}>
          Acessibilidade
        </Text>

        <View style={[styles.grade, { backgroundColor: cartao, borderColor: borda }]}>
          {opcoes.map((opcao, indice) => {
            const colunaEsquerda = indice % 2 === 0;
            const ultimaLinha = indice >= opcoes.length - 2;

            return (
              <Pressable
                key={opcao.chave}
                style={({ pressed }) => [
                  styles.celula,
                  {
                    borderRightWidth: colunaEsquerda ? 1 : 0,
                    borderBottomWidth: ultimaLinha ? 0 : 1,
                    borderColor: borda,
                    backgroundColor: pressed
                      ? modoEscuro
                        ? "#3D2A46"
                        : "#F8EEFF"
                      : "transparent",
                  },
                ]}
                onPress={opcao.aoTocar}
                accessibilityRole="button"
                accessibilityLabel={`${opcao.titulo}. ${opcao.descricao}`}
              >
                <View
                  style={[
                    styles.circuloIcone,
                    {
                      backgroundColor:
                        opcao.ativo === true
                          ? tema.roxo
                          : modoEscuro
                          ? "#4A3A52"
                          : "#F3ECF8",
                    },
                  ]}
                >
                  {opcao.icone}
                </View>
                <Text
                  style={[
                    styles.tituloCelula,
                    { color: texto, fontSize: fonte(14) },
                  ]}
                >
                  {opcao.titulo}
                </Text>
                <Text
                  style={[
                    styles.descricaoCelula,
                    {
                      color: opcao.ativo ? tema.roxoEscuro : secundario,
                      fontSize: fonte(11),
                    },
                  ]}
                >
                  {opcao.descricao}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botaoReset,
            { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
          ]}
          onPress={() => {
            void definirAudioDescricao(false);
            pararFala();
          }}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao padrão de acessibilidade"
        >
          <RotateCcw size={22} color="#303030" strokeWidth={2.3} />
          <Text style={[styles.textoReset, { fontSize: fonte(18) }]}>
            Voltar ao Padrão
          </Text>
        </Pressable>

        <Text style={[styles.rodape, { color: secundario, fontSize: fonte(12) }]}>
          Toque em uma opção para ativar ou saber mais.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  titulo: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 16,
  },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 28,
    borderWidth: 3,
    overflow: "hidden",
  },
  celula: {
    width: "50%",
    minHeight: 150,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloIcone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tituloCelula: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  descricaoCelula: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginTop: 2,
  },
  botaoReset: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  textoReset: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
  },
  rodape: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginTop: 12,
  },
});
