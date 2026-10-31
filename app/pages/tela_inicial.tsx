import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { FundoAmarelo } from "@/components/FundoAmarelo";
import { carregarPainel, type DadosPainel } from "@/lib/painel";

const LUZ = require("../../assets/Lume/Outros elementos/Png/luz-acesa.png");
const ESTRELA = require("../../assets/Lume/Outros elementos/Png/estrela-cinco-pontas.png");
const FUNDO_PROXIMA_LICAO = require("../../assets/images/fundos/Próxima lição (fundo).png");
const FUNDO_TRILHA = require("../../assets/images/fundos/Trilha (fundo).png");

type Dia = {
  iso: string;
  rotulo: string;
};

function ultimosCincoDias(): Dia[] {
  const hoje = new Date();
  return Array.from({ length: 5 }, (_, indice) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (4 - indice));
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    return {
      iso: `${data.getFullYear()}-${mes}-${dia}`,
      rotulo: `${dia}/${mes}`,
    };
  });
}

export default function TelaInicial() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, modoEscuro, fonte } = useAcessibilidade();
  const [dados, setDados] = useState<DadosPainel | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregarPainel().then((resultado) => {
        if (ativo) setDados(resultado);
      });
      return () => {
        ativo = false;
      };
    }, [])
  );

  const dias = useMemo(ultimosCincoDias, []);
  const datasAtivas = dados?.datasAtivas ?? [];
  const diasDeLuz = dados?.ofensiva ?? 0;

  const fundo = modoEscuro ? tema.fundo : "#FFFFFF";
  const cartao = tema.cartao;
  const texto = tema.texto;

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <FundoAmarelo />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <View
          style={[
            styles.cartaoSequencia,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <View style={styles.linhaSequencia}>
            <Image
              source={LUZ}
              style={[styles.luz, diasDeLuz === 0 && { opacity: 0.35 }]}
              resizeMode="contain"
            />
            <Text style={[styles.legenda, { color: texto, fontSize: fonte(16) }]}>
              {diasDeLuz === 0 ? (
                "Sua luz está apagada. Faça uma lição para acendê-la!"
              ) : (
                <>
                  Sua luz está acesa há:{" "}
                  <Text style={[styles.diasLuz, { fontSize: fonte(16) }]}>
                    {diasDeLuz} {diasDeLuz === 1 ? "dia" : "dias"}
                  </Text>
                </>
              )}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.botaoEnergizar,
              { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
            ]}
            onPress={() => router.push("/trilha" as never)}
            accessibilityRole="button"
            accessibilityLabel="Energizar e continuar aprendendo"
          >
            <Text style={[styles.textoEnergizar, { fontSize: fonte(16) }]}>
              Energizar
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.cartaoDias,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <Text style={[styles.tituloCartao, { color: texto, fontSize: fonte(21) }]}>
            Últimos 5 dias
          </Text>
          <View style={styles.linhaDias}>
            {dias.map((dia, indice) => {
              const ativo = datasAtivas.includes(dia.iso);
              return (
                <View
                  key={dia.iso}
                  style={styles.itemDia}
                  accessible
                  accessibilityLabel={`Dia ${dia.rotulo}: ${
                    ativo ? "com atividade" : "sem atividade"
                  }`}
                >
                  <Image
                    source={ESTRELA}
                    style={styles.estrelaDia}
                    tintColor={ativo ? "#FFD651" : "#C9C5C6"}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.dataEstrela,
                      {
                        color: ativo ? "#3B2600" : "#8A8080",
                        fontSize: fonte(11),
                      },
                    ]}
                  >
                    {dia.rotulo}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <CartaoGrande
          fundo={FUNDO_PROXIMA_LICAO}
          sombra={modoEscuro ? "#000" : "#8C3DB8"}
          corTitulo="#2C1038"
          corSubtitulo="#3A1748"
          titulo="Próxima lição"
          subtitulo="Pronto(a) pra brilhar?"
          rotuloAcessibilidade="Próxima lição. Pronto para brilhar?"
          aoPressionar={() => router.push("/trilha" as never)}
          fonte={fonte}
        />

        <CartaoGrande
          fundo={FUNDO_TRILHA}
          sombra={modoEscuro ? "#000" : "#A07B12"}
          corTitulo={texto}
          corSubtitulo={texto}
          titulo="Trilhas"
          subtitulo="Ilumine seu próprio caminho"
          rotuloAcessibilidade="Trilhas. Escolha uma trilha para começar"
          aoPressionar={() => router.push("/trilha" as never)}
          fonte={fonte}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type CartaoGrandeProps = {
  fundo: number;
  sombra: string;
  corTitulo: string;
  corSubtitulo: string;
  titulo: string;
  subtitulo: string;
  rotuloAcessibilidade: string;
  aoPressionar: () => void;
  fonte: (base: number) => number;
};

/**
 * Card grande da home (Próxima lição / Trilhas).
 *
 * O PNG de fundo é um retângulo arredondado com margens transparentes, então
 * ele precisa cobrir o card inteiro: a imagem fica presa ao box do card e o
 * texto é medido dentro de um `View` interno que cresce (`flexGrow`), com
 * `minHeight: 196` só no card. Assim a altura segue o conteúdo e o subtítulo
 * nunca cai fora da forma colorida. Não há cor chapada atrás da imagem: o card
 * mostra só o PNG de fundo (como nos mockups).
 */
function CartaoGrande({
  fundo,
  sombra,
  corTitulo,
  corSubtitulo,
  titulo,
  subtitulo,
  rotuloAcessibilidade,
  aoPressionar,
  fonte,
}: CartaoGrandeProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cartaoGrande,
        {
          opacity: pressed ? 0.9 : 1,
          shadowColor: sombra,
        },
      ]}
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessibilidade}
    >
      <ImageBackground
        source={fundo}
        style={styles.fundoCartao}
        imageStyle={styles.imagemCartao}
        resizeMode="cover"
      >
        <View style={styles.conteudoCartao}>
          <Text
            style={[styles.tituloGrande, { color: corTitulo, fontSize: fonte(32) }]}
          >
            {titulo}
          </Text>
          <Text
            style={[styles.rotuloGrande, { color: corSubtitulo, fontSize: fonte(16) }]}
          >
            {subtitulo}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cartaoSequencia: {
    borderRadius: 18,
    padding: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  linhaSequencia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  luz: {
    width: 66,
    height: 66,
  },
  legenda: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  diasLuz: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
  },
  botaoEnergizar: {
    width: "100%",
    marginTop: 10,
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textoEnergizar: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    textAlign: "center",
  },
  cartaoDias: {
    marginTop: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  tituloCartao: {
    textAlign: "center",
    fontFamily: "Poppins_900Black",
    marginBottom: 12,
  },
  linhaDias: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemDia: {
    width: "19%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  estrelaDia: {
    width: "100%",
    height: "100%",
  },
  dataEstrela: {
    position: "absolute",
    fontFamily: "Poppins_600SemiBold",
  },
  cartaoGrande: {
    marginTop: 16,
    minHeight: 196,
    borderRadius: 18,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  // A imagem de fundo fica presa a este box (width/height 100%) e o "minHeight"
  // garante o tamanho do mockup; quem manda no tamanho é a altura do card.
  fundoCartao: {
    width: "100%",
    minHeight: 196,
    borderRadius: 18,
  },
  imagemCartao: {
    borderRadius: 18,
    width: "100%",
    height: "100%",
  },
  // Texto dentro de um box que cresce com o conteúdo e ocupa o fundo inteiro:
  // com fonte Grande o título quebra em 2 linhas e o card acompanha.
  conteudoCartao: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 28,
  },
  // Título/subtítulo com largura definida: em um pai com alignItems "center"
  // o texto é medido sem limite e estouraria o card (especialmente na fonte
  // Grande). Com "100%" ele quebra linha dentro do card em vez de passar dele.
  rotuloGrande: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 4,
    width: "100%",
  },
  tituloGrande: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    width: "100%",
  },
});
