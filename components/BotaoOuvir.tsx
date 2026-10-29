import { Volume2 } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  /** O que deve ser lido em voz alta. */
  texto: string;
  rotulo?: string;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Botão "Ouvir" (expo-speech, pt-BR).
 * Fica disponível mesmo com a audio-descrição desligada: a pessoa pode
 * escolher ouvir só quando quiser.
 */
export function BotaoOuvir({ texto, rotulo = "Ouvir", estilo }: Props) {
  const { tema, fonte, falar } = useAcessibilidade();

  return (
    <TouchableOpacity
      onPress={() => falar(texto)}
      accessibilityRole="button"
      accessibilityLabel={`${rotulo} em voz alta`}
      accessibilityHint="Lê o texto desta tela em voz alta"
      activeOpacity={0.85}
      style={[
        styles.botao,
        { borderColor: tema.roxo, backgroundColor: tema.cartao },
        estilo,
      ]}
    >
      <Volume2 size={24} color={tema.roxoEscuro} />
      <Text style={[styles.texto, { color: tema.texto, fontSize: fonte(18) }]}>
        {rotulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  texto: {
    fontFamily: "Poppins_600SemiBold",
  },
});
