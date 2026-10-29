import {
  CheckCircle2,
  Hand,
  Map as MapIcon,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  visivel: boolean;
  onFechar: () => void;
};

const PASSOS = [
  {
    Icone: MapIcon,
    titulo: "Este é o seu caminho",
    texto: "Aqui você vê todas as lições, do começo ao fim.",
  },
  {
    Icone: Hand,
    titulo: "Toque na estrela amarela para começar",
    texto: "Ela fica brilhando. É a sua próxima lição.",
  },
  {
    Icone: CheckCircle2,
    titulo: "Cada lição que você termina abre a próxima",
    texto: "Sem pressa. Você pode repetir quantas vezes quiser.",
  },
];

/** Explicação curta na primeira vez que a pessoa abre a trilha. */
export function TutorialTrilha({ visivel, onFechar }: Props) {
  const { tema, fonte } = useAcessibilidade();
  const [indice, setIndice] = useState(0);

  const passo = PASSOS[indice];
  const ultimo = indice === PASSOS.length - 1;
  const Icone = passo.Icone;

  function fechar() {
    setIndice(0);
    onFechar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={fechar}
    >
      <View style={styles.fundo}>
        <View
          style={[styles.cartao, { backgroundColor: tema.cartao }]}
          accessibilityViewIsModal
        >
          <TouchableOpacity
            onPress={fechar}
            accessibilityRole="button"
            accessibilityLabel="Fechar a explicação"
            style={[styles.fechar, { borderColor: tema.borda }]}
          >
            <X size={26} color={tema.texto} />
          </TouchableOpacity>

          <Text style={[styles.contador, { color: tema.textoSecundario, fontSize: fonte(15) }]}>
            Passo {indice + 1} de {PASSOS.length}
          </Text>

          <View style={[styles.circuloIcone, { backgroundColor: tema.roxo }]}>
            <Icone size={44} color="#32064F" />
          </View>

          <ScrollView contentContainerStyle={styles.textos}>
            <Text style={[styles.titulo, { color: tema.texto, fontSize: fonte(26) }]}>
              {passo.titulo}
            </Text>
            <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(19) }]}>
              {passo.texto}
            </Text>
          </ScrollView>

          <BotaoGrande
            titulo={ultimo ? "Entendi" : "Próximo"}
            onPress={() => {
              if (ultimo) {
                fechar();
              } else {
                setIndice((atual) => atual + 1);
              }
            }}
          />

          {!ultimo && (
            <TouchableOpacity
              onPress={fechar}
              accessibilityRole="button"
              accessibilityLabel="Pular explicação"
              style={styles.pular}
            >
              <Text style={[styles.textoPular, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Pular
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  cartao: {
    borderRadius: 26,
    padding: 22,
    gap: 14,
    maxHeight: "90%",
  },
  fechar: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  contador: {
    fontFamily: "Poppins_600SemiBold",
  },
  circuloIcone: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  textos: {
    gap: 8,
    paddingVertical: 4,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  texto: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
  },
  pular: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  textoPular: {
    fontFamily: "Poppins_600SemiBold",
    textDecorationLine: "underline",
  },
});
