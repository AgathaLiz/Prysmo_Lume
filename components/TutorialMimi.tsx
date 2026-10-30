import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const IMAGENS = {
  ensinando: require("../assets/Lume/Mimi/Png/mimi-ensinando.png") as ImageSourcePropType,
  frente: require("../assets/Lume/Mimi/Png/mimi-de-frente.png") as ImageSourcePropType,
  cima: require("../assets/Lume/Mimi/Png/mimi-pra-cima.png") as ImageSourcePropType,
  baixo: require("../assets/Lume/Mimi/Png/mimi-pra-baixo.png") as ImageSourcePropType,
  esquerda: require("../assets/Lume/Mimi/Png/mimi-pra-esquerda.png") as ImageSourcePropType,
  direita: require("../assets/Lume/Mimi/Png/mimi-pra-direita.png") as ImageSourcePropType,
};

type Props = {
  /** O que a Mimi explica nesta etapa. Uma ideia curta por vez. */
  fala: string;
  titulo?: string;
  /** Muda a pose da Mimi conforme o momento da lição. */
  pose?: keyof typeof IMAGENS;
  /** Deixa o balão em amarelo, como um destaque. */
  destaque?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Tutorial da Mimi dentro da lição.
 *
 * Aparece em todas as etapas com uma explicação curta e específica.
 * É só leitura: o texto também é anunciado pelos leitores de tela.
 * A imagem não se mexe, então funciona bem com "reduzir movimento".
 */
export function TutorialMimi({
  fala,
  titulo = "Mimi explica",
  pose = "ensinando",
  destaque = false,
  estilo,
}: Props) {
  const { tema, fonte } = useAcessibilidade();

  const corTexto = destaque ? "#32064F" : tema.texto;
  const corRotulo = destaque ? "#32064F" : tema.roxoEscuro;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${titulo}: ${fala}`}
      accessibilityLiveRegion="polite"
      style={[styles.linha, estilo]}
    >
      <Image
        source={IMAGENS[pose]}
        style={styles.mascote}
        resizeMode="contain"
        accessible={false}
        importantForAccessibility="no"
      />

      <View
        style={[
          styles.balao,
          {
            backgroundColor: destaque ? tema.amareloSuave : tema.cartao,
            borderColor: destaque ? tema.amareloSuave : tema.borda,
          },
        ]}
      >
        <Text
          style={[
            styles.rotulo,
            { color: corRotulo, fontSize: fonte(13) },
          ]}
        >
          {titulo.toUpperCase()}
        </Text>
        <Text
          style={[styles.texto, { color: corTexto, fontSize: fonte(18) }]}
        >
          {fala}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  mascote: {
    width: 72,
    height: 104,
    flexShrink: 0,
  },
  balao: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  rotulo: {
    fontFamily: "Poppins_800ExtraBold",
    letterSpacing: 0.6,
  },
  texto: {
    fontFamily: "Poppins_600SemiBold",
  },
});
