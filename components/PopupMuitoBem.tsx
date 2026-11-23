import { PartyPopper } from "lucide-react-native";
import { useEffect } from "react";
import {
  AccessibilityInfo,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  visivel: boolean;
  /** Quantos acertos seguidos a pessoa tem. */
  sequencia: number;
  aoFechar: () => void;
};

/**
 * Comemoração de sequência de acertos, no espírito das comemorações do
 * Duolingo. É um cartão pequeno, só para marcar a sequência, e não substitui
 * o feedback da resposta (que fica na própria tela da pergunta).
 */
export function PopupMuitoBem({ visivel, sequencia, aoFechar }: Props) {
  const { tema, fonte } = useAcessibilidade();

  useEffect(() => {
    if (!visivel) return;
    AccessibilityInfo.announceForAccessibility(
      sequencia > 1
        ? `Muito bem! Você acertou ${sequencia} vezes seguidas.`
        : "Muito bem! Você acertou."
    );
  }, [visivel, sequencia]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <View style={styles.fundo}>
        <View
          style={[
            styles.cartao,
            { backgroundColor: tema.cartao, borderColor: tema.roxo },
          ]}
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
        >
          <View style={styles.linha}>
            <View
              style={[
                styles.selo,
                { backgroundColor: tema.amarelo, borderColor: tema.destaque },
              ]}
            >
              <PartyPopper size={28} color="#32064F" strokeWidth={2.2} />
            </View>

            <View style={styles.textos}>
              <Text
                style={[
                  styles.titulo,
                  { color: tema.roxoEscuro, fontSize: fonte(26) },
                ]}
              >
                Muito bem!
              </Text>
              <Text
                style={[
                  styles.sequencia,
                  { color: tema.texto, fontSize: fonte(15) },
                ]}
              >
                {sequencia}{" "}
                {sequencia === 1 ? "acerto seguido" : "acertos seguidos"}!
              </Text>
            </View>
          </View>

          <BotaoGrande
            titulo="Continuar"
            variante="roxo"
            onPress={aoFechar}
            estilo={styles.botao}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(50, 6, 79, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  cartao: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 3,
    padding: 16,
    gap: 12,
    shadowColor: "#32064F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textos: {
    flex: 1,
    gap: 1,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
  },
  sequencia: {
    fontFamily: "Poppins_600SemiBold",
  },
  botao: {
    minHeight: 48,
    paddingVertical: 8,
  },
});
