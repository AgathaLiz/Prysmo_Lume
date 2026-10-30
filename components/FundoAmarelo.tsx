import React from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";

const FUNDO_AMARELO = require("../assets/images/fundos/Fundo - amarelo.png");

type Props = {
  /** Altura aproximada da faixa amarela visível no topo da tela. */
  altura?: number;
};

/**
 * Faixa amarela decorativa do topo das telas principais.
 *
 * Usa a forma pronta do design (`Fundo - amarelo.png`): ela fica atrás do
 * conteúdo, com os cantos de baixo arredondados e uma sombra leve separando
 * o topo colorido do fundo branco da tela.
 */
export function FundoAmarelo({ altura = 250 }: Props) {
  const { width } = useWindowDimensions();

  // A imagem tem 402x295 px. Esticamos um pouco além das laterais para
  // esconder os cantos de cima e deixar aparecer só a borda de baixo.
  const sangria = 22;
  const largura = width + sangria * 2;
  const alturaImagem = (295 / 402) * largura;
  const topo = altura - alturaImagem;

  return (
    <Image
      source={FUNDO_AMARELO}
      resizeMode="stretch"
      style={[
        styles.forma,
        { width: largura, height: alturaImagem, top: topo, left: -sangria },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  forma: {
    position: "absolute",
    pointerEvents: "none",
  },
});
