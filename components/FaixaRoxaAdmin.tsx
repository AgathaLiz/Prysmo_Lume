import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

/** Raio dos cantos de baixo, na largura de referência do design (402 px). */
const RAIO_BASE = 14;
const LARGURA_BASE = 402;

type Props = {
  /** Altura da faixa (medida pelo bloco do topo de cada tela). */
  altura: number;
};

/**
 * Faixa roxa do topo das telas de administração (gerenciar lições, unidades e
 * informações da lição), como no mockup: cor lisa, canto de cima reto e só os
 * de baixo arredondados.
 */
export function FaixaRoxaAdmin({ altura }: Props) {
  const { width } = useWindowDimensions();
  const raio = Math.max(16, (RAIO_BASE / LARGURA_BASE) * width);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.faixa,
        {
          height: altura,
          borderBottomLeftRadius: raio,
          borderBottomRightRadius: raio,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  faixa: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E9B8FF",
  },
});
