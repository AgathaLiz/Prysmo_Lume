import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Medidas } from "@/constants/cores";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

/** Gradiente do mockup das telas de fim de lição: roxo -> pêssego. */
export const GRADIENTE_LICAO: readonly [string, string] = ["#C77DFF", "#FFC08A"];

type Props = {
  titulo: string;
  onPress: () => void;
  desabilitado?: boolean;
  carregando?: boolean;
  descricaoAcessivel?: string;
  /** Altura mínima (o padrão é 64, o mesmo do BotaoGrande). */
  altura?: number;
  /** Raio das bordas (o padrão é o do BotaoGrande). */
  raio?: number;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Botão "Continuar" das telas de fim de lição. Tem o mesmo tamanho e a mesma
 * área de toque do BotaoGrande, mas com o fundo em gradiente do mockup.
 *
 * O gradiente é desenhado por baixo do texto; como ele já sai arredondado,
 * a sombra do botão continua aparecendo normalmente.
 */
export function BotaoGradiente({
  titulo,
  onPress,
  desabilitado = false,
  carregando = false,
  descricaoAcessivel,
  altura = 64,
  raio = Medidas.raioBotao,
  estilo,
}: Props) {
  const { tema, fonte } = useAcessibilidade();
  const inativo = desabilitado || carregando;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inativo}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={descricaoAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={[
        styles.botao,
        { minHeight: altura, borderRadius: raio, opacity: inativo ? 0.6 : 1 },
        estilo,
      ]}
    >
      <LinearGradient
        colors={GRADIENTE_LICAO}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: raio }]}
      />

      {carregando && <ActivityIndicator size="small" color={tema.texto} />}

      <Text style={[styles.texto, { color: tema.texto, fontSize: fonte(22) }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: "100%",
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  texto: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
});
