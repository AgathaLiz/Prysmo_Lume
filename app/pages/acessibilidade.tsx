import {
  Captions,
  Check,
  Gauge,
  Hand,
  Palette,
  PauseCircle,
  RotateCcw,
  Volume2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import {
  useAcessibilidade,
  type ModoDaltonismo,
  type VelocidadeAudio,
} from "@/hooks/use-acessibilidade";

const ROTULOS_DALTONISMO: Record<ModoDaltonismo, string> = {
  nenhum: "Desativado",
  alto_contraste: "Alto contraste",
  deuteranopia: "Verde / Vermelho",
  tritanopia: "Azul / Amarelo",
};

const VELOCIDADES: VelocidadeAudio[] = [0.75, 0.9, 1.15];

const ROTULOS_VELOCIDADE: Record<VelocidadeAudio, string> = {
  0.75: "0,75x (Lento)",
  0.9: "0,9x (Normal)",
  1.15: "1,15x (Rápido)",
};

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
    fonte,
    audioDescricao,
    reduzirMovimento,
    pararAnimacoes,
    daltonismo,
    velocidadeAudio,
    legendas,
    libras,
    definirAudioDescricao,
    definirPararAnimacoes,
    definirDaltonismo,
    definirVelocidadeAudio,
    definirLegendas,
    definirLibras,
    restaurarPadrao,
    falar,
    pararFala,
  } = useAcessibilidade();

  const [modalDaltonismo, setModalDaltonismo] = useState(false);

  const fundo = "#F8F4FC";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const borda = daltonismo === "alto_contraste" ? tema.borda : "#DFC3F5";

  const alternarAudio = async () => {
    const novo = !audioDescricao;
    await definirAudioDescricao(novo);

    if (novo) {
      falar("Áudio descrição ativada. Os textos importantes podem ser ouvidos.");
    } else {
      pararFala();
    }
  };

  const alternarAnimacoes = async () => {
    const novo = !pararAnimacoes;
    await definirPararAnimacoes(novo);
    if (audioDescricao) {
      falar(novo ? "Animações reduzidas ativadas." : "Animações normais ativadas.");
    }
  };

  const alternarLibras = async () => {
    const novo = !libras;
    await definirLibras(novo);
    if (audioDescricao) {
      falar(novo ? "Apoio em Libras ativado." : "Apoio em Libras desativado.");
    }
  };

  const alternarLegendas = async () => {
    const novo = !legendas;
    await definirLegendas(novo);
    if (audioDescricao) {
      falar(novo ? "Legendas nos vídeos ativadas." : "Legendas nos vídeos desativadas.");
    }
  };

  const alternarVelocidade = async () => {
    const idx = VELOCIDADES.indexOf(velocidadeAudio);
    const proxima = VELOCIDADES[(idx + 1) % VELOCIDADES.length];
    await definirVelocidadeAudio(proxima);
    falar(`Velocidade do áudio ajustada para ${ROTULOS_VELOCIDADE[proxima]}.`);
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
      descricao: reduzirMovimento ? "Ativado" : "Desativado",
      icone: <PauseCircle size={30} color={texto} />,
      ativo: reduzirMovimento,
      aoTocar: () => void alternarAnimacoes(),
    },
    {
      chave: "daltonismo",
      titulo: "Daltonismo",
      descricao: ROTULOS_DALTONISMO[daltonismo],
      icone: <Palette size={30} color={texto} />,
      ativo: daltonismo !== "nenhum",
      aoTocar: () => setModalDaltonismo(true),
    },
    {
      chave: "libras",
      titulo: "Libras",
      descricao: libras ? "Ativado" : "Desativado",
      icone: <Hand size={30} color={texto} />,
      ativo: libras,
      aoTocar: () => void alternarLibras(),
    },
    {
      chave: "legendas",
      titulo: "Legendas",
      descricao: legendas ? "Ativado" : "Desativado",
      icone: <Captions size={30} color={texto} />,
      ativo: legendas,
      aoTocar: () => void alternarLegendas(),
    },
    {
      chave: "velocidade",
      titulo: "Velocidade do Áudio",
      descricao: ROTULOS_VELOCIDADE[velocidadeAudio],
      icone: <Gauge size={30} color={texto} />,
      ativo: velocidadeAudio !== 0.9,
      aoTocar: () => void alternarVelocidade(),
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
                    backgroundColor: pressed ? "#F8EEFF" : "transparent",
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
                        opcao.ativo === true ? tema.roxo : "#F3ECF8",
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
            void restaurarPadrao();
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
          Toque em uma opção para ativar ou ajustar.
        </Text>
      </ScrollView>

      <Modal
        visible={modalDaltonismo}
        transparent
        animationType={reduzirMovimento ? "none" : "fade"}
        onRequestClose={() => setModalDaltonismo(false)}
      >
        <View style={styles.fundoModal}>
          <View style={[styles.caixaModal, { backgroundColor: cartao }]}>
            <Text style={[styles.tituloModal, { color: texto, fontSize: fonte(20) }]}>
              Modo para Daltonismo
            </Text>

            {(Object.keys(ROTULOS_DALTONISMO) as ModoDaltonismo[]).map((modo) => {
              const marcado = daltonismo === modo;
              return (
                <Pressable
                  key={modo}
                  style={[
                    styles.opcaoModal,
                    {
                      borderColor: marcado ? tema.roxoEscuro : borda,
                      backgroundColor: marcado ? "#F3E5FC" : "transparent",
                    },
                  ]}
                  onPress={() => {
                    void definirDaltonismo(modo);
                    setModalDaltonismo(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: marcado }}
                >
                  <Text
                    style={[
                      styles.textoOpcaoModal,
                      { color: texto, fontSize: fonte(16) },
                    ]}
                  >
                    {ROTULOS_DALTONISMO[modo]}
                  </Text>
                  {marcado ? <Check size={20} color={tema.roxoEscuro} /> : null}
                </Pressable>
              );
            })}

            <Pressable
              style={[styles.fecharModal, { borderColor: borda }]}
              onPress={() => setModalDaltonismo(false)}
              accessibilityRole="button"
            >
              <Text style={[styles.textoFecharModal, { color: texto, fontSize: fonte(16) }]}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    flexShrink: 1,
    textAlign: "center",
  },
  rodape: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginTop: 12,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(26, 5, 36, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  caixaModal: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  tituloModal: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    marginBottom: 6,
  },
  opcaoModal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  textoOpcaoModal: {
    fontFamily: "Poppins_600SemiBold",
  },
  fecharModal: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textoFecharModal: {
    fontFamily: "Poppins_800ExtraBold",
  },
});
