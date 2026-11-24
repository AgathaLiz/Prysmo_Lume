import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

const FUNDO_AMARELO = require("../assets/images/fundos/Fundo - amarelo.png");
const FUNDO_ADM = require("../assets/Lume/Facilidades pro app/Png/Outros Fundos/Fundo-adm.png");

type Props = {
  /** Altura da faixa (ou do painel) onde a imagem é desenhada. */
  altura?: number;
  /** Largura da imagem; por padrão, a largura da tela. */
  largura?: number;
};

/**
 * Faixas do topo das telas do administrador.
 *
 * As duas imagens do design já vêm com os cantos de baixo arredondados e uma
 * sombra leve embaixo. Desenhamos exatamente na largura da tela para esses
 * cantos aparecerem de verdade (antes a imagem era esticada além das laterais
 * para esconder os cantos de cima, e com isso os de baixo sumiam, deixando a
 * faixa reta).
 *
 * Se a faixa pedida for mais alta que a imagem, ela estica na vertical. Como é
 * cor lisa/suave, o alongamento não aparece.
 */

/** Cor lisa da faixa amarela (a mesma do arquivo de imagem). */
const AMARELO = "#FFD651";

/**
 * Na imagem `Fundo - amarelo.png` (402x295), a forma amarela termina em 273 px:
 * embaixo ficam só a sombra e os cantos arredondados.
 */
const FRACAO_FORMA = 273 / 295;

/** Raio dos cantos de baixo da forma (na imagem de 402 px de largura). */
const RAIO_FORMA = 14;

/** Faixa amarela: usada nas telas de conta, permissões e criação de lição. */
export function FundoAdmin({ altura = 250 }: Props) {
  const { width } = useWindowDimensions();
  const raio = (RAIO_FORMA / 402) * width;

  return (
    <>
      {/*
        A imagem tem os quatro cantos arredondados. Em cima a faixa encosta no
        topo da tela, então a cor lisa por trás deixa os cantos de cima retos e
        só os de baixo ficam arredondados.
      */}
      <View
        pointerEvents="none"
        style={[
          styles.base,
          {
            height: altura * FRACAO_FORMA,
            backgroundColor: AMARELO,
            borderBottomLeftRadius: raio,
            borderBottomRightRadius: raio,
          },
        ]}
      />

      <Image
        source={FUNDO_AMARELO}
        resizeMode="stretch"
        style={[styles.forma, { width, height: altura }]}
      />
    </>
  );
}

/**
 * Faixa do perfil: o degradê roxo/amarelo do design, atrás da foto e do nome.
 * Também usada no painel da tela de unidades, que é mais estreito que a tela —
 * por isso dá para dizer a largura (por padrão, a da tela).
 */
export function FundoAdminPerfil({ altura = 250, largura }: Props) {
  const { width: larguraJanela } = useWindowDimensions();

  return (
    <Image
      source={FUNDO_ADM}
      resizeMode="stretch"
      style={[styles.forma, { width: largura ?? larguraJanela, height: altura }]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  forma: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
  },
});
