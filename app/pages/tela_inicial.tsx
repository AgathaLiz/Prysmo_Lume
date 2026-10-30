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
  const diasDeLuz = dados?.diasAtivos && dados.diasAtivos > 0 ? dados.diasAtivos : 2;

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
            <Image source={LUZ} style={styles.luz} resizeMode="contain" />
            <Text
              style={[styles.legenda, { color: texto, fontSize: fonte(16) }]}
              numberOfLines={2}
            >
              Sua luz está acesa há:{" "}
              <Text style={[styles.diasLuz, { fontSize: fonte(16) }]}>
                {diasDeLuz} {diasDeLuz === 1 ? "dia" : "dias"}
              </Text>
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
              const ativo =
                datasAtivas.length > 0
                  ? datasAtivas.includes(dia.iso)
                  : indice < 2;
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

        <Pressable
          style={({ pressed }) => [
            styles.cartaoGrande,
            {
              opacity: pressed ? 0.9 : 1,
              shadowColor: modoEscuro ? "#000" : "#8C3DB8",
            },
          ]}
          onPress={() => router.push("/trilha" as never)}
          accessibilityRole="button"
          accessibilityLabel="Próxima lição. Pronto para brilhar?"
        >
          <ImageBackground
            source={FUNDO_PROXIMA_LICAO}
            style={styles.fundoCartao}
            imageStyle={styles.imagemCartao}
            resizeMode="cover"
          >
            <Text style={[styles.tituloGrande, { color: "#2C1038", fontSize: fonte(32) }]}>
              Próxima lição
            </Text>
            <Text style={[styles.rotuloGrande, { color: "#3A1748", fontSize: fonte(16) }]}>
              Pronto(a) pra brilhar?
            </Text>
          </ImageBackground>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.cartaoGrande,
            {
              opacity: pressed ? 0.9 : 1,
              shadowColor: modoEscuro ? "#000" : "#A07B12",
            },
          ]}
          onPress={() => router.push("/trilha" as never)}
          accessibilityRole="button"
          accessibilityLabel="Trilhas. Escolha uma trilha para começar"
        >
          <ImageBackground
            source={FUNDO_TRILHA}
            style={styles.fundoCartao}
            imageStyle={styles.imagemCartao}
            resizeMode="cover"
          >
            <Text style={[styles.tituloGrande, { color: texto, fontSize: fonte(32) }]}>
              Trilhas
            </Text>
            <Text style={[styles.rotuloGrande, { color: texto, fontSize: fonte(16) }]}>
              Ilumine seu próprio caminho
            </Text>
          </ImageBackground>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  fundoCartao: {
    width: "100%",
    minHeight: 196,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 28,
  },
  imagemCartao: {
    borderRadius: 18,
  },
  rotuloGrande: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 4,
  },
  tituloGrande: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    maxWidth: "100%",
    flexShrink: 1,
  },
});
