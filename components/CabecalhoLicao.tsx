import { HelpCircle, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BotaoOuvir } from "@/components/BotaoOuvir";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  titulo: string;
  /** 1-based. Null esconde o "Etapa X de Y" (ex.: introdução). */
  etapaAtual: number | null;
  totalEtapas: number;
  textoOuvir?: string;
  onFechar: () => void;
  onAjuda: () => void;
};

/**
 * Topo da lição: fechar, nome, etapa, barra de progresso, ouvir e ajuda.
 * Fica fixo para a pessoa nunca se perder.
 */
export function CabecalhoLicao({
  titulo,
  etapaAtual,
  totalEtapas,
  textoOuvir,
  onFechar,
  onAjuda,
}: Props) {
  const { tema, fonte } = useAcessibilidade();

  const progresso =
    etapaAtual === null || totalEtapas === 0 ? 0 : etapaAtual / totalEtapas;

  return (
    <View style={[styles.container, { borderBottomColor: tema.borda }]}>
      <View style={styles.linha}>
        <TouchableOpacity
          onPress={onFechar}
          accessibilityRole="button"
          accessibilityLabel="Sair da lição"
          style={[styles.iconeBotao, { borderColor: tema.borda }]}
        >
          <X size={26} color={tema.texto} />
        </TouchableOpacity>

        <Text
          style={[styles.titulo, { color: tema.texto, fontSize: fonte(20) }]}
          numberOfLines={2}
        >
          {titulo}
        </Text>

        <TouchableOpacity
          onPress={onAjuda}
          accessibilityRole="button"
          accessibilityLabel="Ajuda: o que fazer agora"
          style={[styles.botaoAjuda, { borderColor: tema.roxo, backgroundColor: tema.cartao }]}
        >
          <HelpCircle size={24} color={tema.roxoEscuro} />
          <Text style={[styles.textoAjuda, { color: tema.texto, fontSize: fonte(15) }]}>
            Ajuda
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linhaEtapa}>
        <Text
          style={[styles.etapa, { color: tema.textoSecundario, fontSize: fonte(15) }]}
        >
          {etapaAtual === null
            ? "Vamos começar"
            : `Etapa ${etapaAtual} de ${totalEtapas}`}
        </Text>

        {textoOuvir ? <BotaoOuvir texto={textoOuvir} /> : null}
      </View>

      <View style={[styles.barra, { backgroundColor: tema.borda }]}>
        <View
          style={[
            styles.barraPreenchida,
            {
              width: `${Math.round(progresso * 100)}%`,
              backgroundColor: tema.roxoEscuro,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconeBotao: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    flex: 1,
    fontFamily: "Poppins_800ExtraBold",
  },
  botaoAjuda: {
    minHeight: 56,
    minWidth: 56,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  textoAjuda: {
    fontFamily: "Poppins_600SemiBold",
  },
  linhaEtapa: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  etapa: {
    fontFamily: "Poppins_600SemiBold",
  },
  barra: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 5,
  },
});
