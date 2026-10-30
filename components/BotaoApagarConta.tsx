import { Trash2 } from "lucide-react-native";
import { Alert, Platform, Pressable, StyleSheet, Text } from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

/**
 * Botão "Apagar Conta" — mesmo layout do "Sair da Conta" (mesma altura,
 * raio, ícone 30 + Poppins Black em `fonte(24)`, fundo roxo e brilho ao
 * pressionar), só muda o rótulo e a confirmação (destrutiva).
 *
 * Hoje ele só pede confirmação, sem efeito no banco: excluir a conta de
 * verdade depende de um endpoint/funcionamento no Supabase (auth + linhas
 * de progresso), o que exige regras novas. O ponto de execução está
 * marcado com TODO nos dois casos (web e app).
 */
export function BotaoApagarConta() {
  const { tema, fonte } = useAcessibilidade();

  const confirmarApagamento = () => {
    const mensagem =
      "Deseja mesmo apagar sua conta? Essa ação não pode ser desfeita.";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(mensagem)) {
        // TODO: apagar a conta quando isso existir no backend.
        console.log("Apagar conta confirmada (ainda sem efeito).");
      }
      return;
    }

    Alert.alert("Apagar conta", mensagem, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: () => {
          // TODO: apagar a conta quando isso existir no backend.
          console.log("Apagar conta confirmada (ainda sem efeito).");
        },
      },
    ]);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.botaoApagar,
        { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
      ]}
      onPress={confirmarApagamento}
      accessibilityRole="button"
      accessibilityLabel="Apagar conta"
    >
      <Trash2 size={30} color="#303030" strokeWidth={2.3} />
      <Text style={[styles.textoApagar, { fontSize: fonte(24) }]}>
        Apagar Conta
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botaoApagar: {
    marginTop: 24,
    marginBottom: 16,
    minHeight: 72,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  textoApagar: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    flexShrink: 1,
    textAlign: "center",
  },
});