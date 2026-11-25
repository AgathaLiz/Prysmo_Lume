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

/** Altura de cada parada da trilha (estrela + rótulo). */
export const ALTURA_NO = 180;
/** Centro vertical da estrela dentro da parada. */
export const Y_CENTRO = 66;
const TAMANHO_ATUAL = 104;
const TAMANHO_NORMAL = 92;
const LARGURA_TOQUE = 190;

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
 * O caminho contínuo entre as estrelas é desenhado em SVG pela tela da trilha.
 * Aqui ficam a estrela brilhante, o estado discreto e o nome da lição.
 */
export function NoTrilha({ licao, offset, onPress }: Props) {
  const { fonte, reduzirMovimento } = useAcessibilidade();
  const { width: larguraJanela } = useWindowDimensions();

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

  const corIcone = bloqueada ? "#F3E8FF" : "#6B4200";
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
            opacity: bloqueada ? 0.72 : 1,
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
              opacity: bloqueada ? 0.45 : 1,
            }}
          />

          <View style={styles.iconeCentro} pointerEvents="none">
            <Icone
              size={atual ? 28 : 22}
              color={corIcone}
              strokeWidth={2.6}
              style={{ opacity: bloqueada ? 0.9 : 0.75 }}
            />
          </View>
        </Animated.View>

        <Text
          style={[
            styles.rotulo,
            {
              color: atual ? TrilhaCores.estrela : TrilhaCores.texto,
              fontSize: fonte(16),
              opacity: bloqueada ? 0.78 : 0.98,
              fontFamily: atual ? "Poppins_800ExtraBold" : "Poppins_600SemiBold",
              textShadowColor: "rgba(11, 8, 32, 0.95)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 8,
            },
          ]}
          numberOfLines={2}
        >
          {licao.titulo}
        </Text>

        {concluida && (
          <View style={styles.linhaEstrelas}>
            {Array.from({ length: 3 }).map((_, indice) => (
              <Star
                key={indice}
                size={11}
                color={
                  indice < estrelasConquistadas
                    ? TrilhaCores.estrela
                    : "rgba(255,255,255,0.28)"
                }
                fill={
                  indice < estrelasConquistadas
                    ? TrilhaCores.estrela
                    : "transparent"
                }
              />
            ))}
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
  rotulo: {
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  linhaEstrelas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
});
