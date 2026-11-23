import type { ReactNode } from "react";
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

type Variante = "amarelo" | "roxo" | "contorno" | "perigo";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: ReactNode;
  desabilitado?: boolean;
  carregando?: boolean;
  /** Para quando só o título não explica o que acontece. */
  descricaoAcessivel?: string;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Botão grande das telas novas. Segue o padrão das telas existentes:
 * fundo amarelo #FFD651, cantos arredondados e Poppins 800.
 * Altura mínima de 64 (acima dos 56 recomendados) por causa do tremor.
 * A variante "perigo" usa o vermelho do tema para ações destrutivas.
 */
export function BotaoGrande({
  titulo,
  onPress,
  variante = "amarelo",
  icone,
  desabilitado = false,
  carregando = false,
  descricaoAcessivel,
  estilo,
}: Props) {
  const { tema, fonte } = useAcessibilidade();

  const fundo =
    variante === "amarelo"
      ? tema.amarelo
      : variante === "roxo"
        ? tema.roxo
        : variante === "perigo"
          ? tema.erro
          : "transparent";

  const corTexto = variante === "perigo" ? "#FFFFFF" : tema.texto;
  const inativo = desabilitado || carregando;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inativo}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={descricaoAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={[
        styles.botao,
        {
          backgroundColor: fundo,
          borderColor: variante === "contorno" ? tema.roxo : fundo,
          borderWidth: variante === "contorno" ? 2 : 0,
          shadowColor:
            variante === "contorno"
              ? "transparent"
              : variante === "perigo"
                ? tema.erro
                : "#000",
          opacity: inativo ? 0.6 : 1,
        },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={corTexto} />
      ) : (
        icone
      )}
      <Text
        style={[
          styles.texto,
          { color: corTexto, fontSize: fonte(22) },
        ]}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: "100%",
    minHeight: 64,
    borderRadius: Medidas.raioBotao,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
