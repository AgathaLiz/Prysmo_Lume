import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  onPress?: () => void;
  cor?: string;
  semTexto?: boolean;
};

export function BotaoVoltar({ onPress, cor, semTexto = false }: Props) {
  const router = useRouter();
  const { tema, fonte } = useAcessibilidade();
  const corFinal = cor ?? tema.texto;

  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <ChevronLeft size={30} color={corFinal} strokeWidth={2.5} />
      {!semTexto ? (
        <Text style={[styles.texto, { color: corFinal, fontSize: fonte(19) }]}>
          Voltar
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    minHeight: 44,
    paddingRight: 12,
    marginBottom: 4,
  },
  texto: {
    fontFamily: "Poppins_600SemiBold",
    marginLeft: -2,
  },
});
