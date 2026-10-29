import { Check, Lock, Play, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { TrilhaCores } from "@/constants/cores";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import type { LicaoTrilha } from "@/lib/trilha";

/** Altura de cada parada da trilha (estrela + nome). */
export const ALTURA_NO = 252;
/** Centro vertical da estrela dentro da parada. */
export const Y_CENTRO = 86;
const TAMANHO_ATUAL = 116;
const TAMANHO_NORMAL = 100;
const LARGURA_TOQUE = 150;

const ESTRELA_TRILHA = require("../assets/images/Lição (estrela).png");

type Props = {
  licao: LicaoTrilha;
  /** Deslocamento horizontal em px (caminho ondulado). */
  offset: number;
  onPress: (licao: LicaoTrilha) => void;
};

/**
 * Um nó da trilha em forma de estrela.
 *
 * O caminho entre as estrelas é uma imagem única desenhada pela tela da
 * trilha. Aqui ficam a estrela, o ícone de estado e o nome da lição.
 */
export function NoTrilha({ licao, offset, onPress }: Props) {
  const { fonte, reduzirMovimento } = useAcessibilidade();
  const { width: larguraJanela } = useWindowDimensions();

  // A lista tem margem lateral; medimos o item de verdade para a estrela
  // ficar centralizada e o caminho não sair do lugar.
  const [larguraItem, setLarguraItem] = useState(
    Math.max(0, larguraJanela - 32)
  );

  const concluida = licao.estado === "concluida";
  const atual = licao.estado === "atual";
  const bloqueada = licao.estado === "bloqueada";

  const tamanho = atual ? TAMANHO_ATUAL : TAMANHO_NORMAL;
  const centro = larguraItem / 2;
  const x = centro + offset;

  const pulso = useSharedValue(1);

  useEffect(() => {
    if (!atual || reduzirMovimento) {
      cancelAnimation(pulso);
      pulso.value = 1;
      return;
    }

    // Pulso leve e lento: chama atenção sem assustar.
    pulso.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => cancelAnimation(pulso);
  }, [atual, reduzirMovimento, pulso]);

  const estiloPulso = useAnimatedStyle(() => ({
    transform: [{ scale: pulso.value }],
  }));

  const rotulo = concluida
    ? "Feita"
    : atual
      ? licao.jaTentou
        ? "Continuar"
        : "Começar"
      : "Bloqueada";

  const descricaoEstado = concluida
    ? "Lição já feita"
    : atual
      ? "Sua próxima lição"
      : "Lição bloqueada";

  const corIcone = bloqueada ? "#E3D3EA" : "#5C3A00";

  const Icone = concluida ? Check : atual ? Play : Lock;

  const estrelasConquistadas = concluida ? licao.estrelas : 0;

  return (
    <View
      style={{ height: ALTURA_NO }}
      onLayout={(evento) => setLarguraItem(evento.nativeEvent.layout.width)}
    >
      <TouchableOpacity
        onPress={() => onPress(licao)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${licao.titulo}. ${descricaoEstado}. ${rotulo}.${
          concluida ? ` ${estrelasConquistadas} estrelas.` : ""
        }`}
        accessibilityHint={
          bloqueada
            ? "Termine a lição anterior para abrir esta"
            : "Abre a lição"
        }
        style={[
          styles.areaToque,
          {
            left: x - LARGURA_TOQUE / 2,
            top: Y_CENTRO - tamanho / 2,
            opacity: bloqueada ? 0.84 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.estrelaArea,
            { width: tamanho, height: tamanho },
            atual && estiloPulso,
          ]}
        >
          <Image
            source={ESTRELA_TRILHA}
            resizeMode="contain"
            style={{
              width: tamanho,
              height: tamanho,
              opacity: bloqueada ? 0.38 : 1,
            }}
          />

          <View style={styles.iconeCentro} pointerEvents="none">
            <Icone size={atual ? 38 : 30} color={corIcone} />
          </View>
        </Animated.View>

        {atual && <View style={styles.pontoAtual} />}

        <Text
          style={[
            styles.rotulo,
            {
              color: TrilhaCores.texto,
              fontSize: fonte(16),
              opacity: bloqueada ? 0.85 : 1,
              fontFamily: atual ? "Poppins_800ExtraBold" : "Poppins_600SemiBold",
              textShadowColor: "rgba(30, 4, 46, 0.95)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            },
          ]}
          numberOfLines={2}
        >
          {licao.titulo}
        </Text>

        {concluida ? (
          <View style={styles.linhaEstrelas}>
            {Array.from({ length: 3 }).map((_, indice) => (
              <Star
                key={indice}
                size={13}
                color={
                  indice < estrelasConquistadas
                    ? TrilhaCores.estrela
                    : TrilhaCores.borda
                }
                fill={
                  indice < estrelasConquistadas
                    ? TrilhaCores.estrela
                    : "transparent"
                }
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.selo,
              atual
                ? { backgroundColor: TrilhaCores.abaAtiva }
                : { backgroundColor: "rgba(43, 6, 64, 0.72)" },
            ]}
          >
            <Icone
              size={13}
              color={atual ? TrilhaCores.textoAbaAtiva : TrilhaCores.textoSecundario}
            />
            <Text
              style={[
                styles.textoSelo,
                {
                  color: atual
                    ? TrilhaCores.textoAbaAtiva
                    : TrilhaCores.textoSecundario,
                  fontSize: fonte(13),
                },
              ]}
            >
              {rotulo}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  areaToque: {
    position: "absolute",
    width: LARGURA_TOQUE,
    alignItems: "center",
  },
  estrelaArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconeCentro: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pontoAtual: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: TrilhaCores.estrela,
    marginTop: 3,
  },
  rotulo: {
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  linhaEstrelas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(43, 6, 64, 0.62)",
  },
  selo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  textoSelo: {
    fontFamily: "Poppins_600SemiBold",
  },
});
