import { BatteryFull, Signal, Wifi } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  children: ReactNode;
  /**
   * Ocupa toda a altura que o pai oferecer (vídeo e simulação).
   * Sem isso, a moldura mantém a proporção de um celular.
   */
  preencher?: boolean;
  /** Esconde a barra de status quando o conteúdo já desenha a própria. */
  semBarraStatus?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Moldura de celular usada no vídeo e na simulação.
 *
 * O desenho segue o mockup: borda preta, botões laterais, notch e a
 * barra de status com hora e ícones. Só é decoração — quem usa leitor
 * de tela continua ouvindo o conteúdo de dentro.
 */
export function MolduraCelular({
  children,
  preencher = false,
  semBarraStatus = false,
  estilo,
}: Props) {
  return (
    <View
      style={[
        styles.moldura,
        preencher ? styles.preencher : styles.proporcao,
        estilo,
      ]}
    >
      {/* Botões físicos do aparelho (decoração). */}
      <View style={[styles.botaoLateral, { top: 92, height: 24 }]} />
      <View style={[styles.botaoLateral, { top: 130, height: 40 }]} />
      <View style={[styles.botaoLateral, { top: 180, height: 40 }]} />
      <View style={[styles.botaoLateralDireito, { top: 142, height: 58 }]} />

      <View style={styles.tela}>
        {!semBarraStatus && (
          <View style={styles.barraStatus} pointerEvents="none">
            <Text style={styles.hora}>9:41</Text>
            <View style={styles.iconesStatus}>
              <Signal size={14} color="#303030" />
              <Wifi size={15} color="#303030" />
              <BatteryFull size={16} color="#303030" />
            </View>
          </View>
        )}

        <View style={styles.conteudo}>{children}</View>
      </View>

      <View style={styles.notch} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: {
    alignSelf: "center",
    maxWidth: 340,
    backgroundColor: "#1A1A1A",
    borderRadius: 46,
    padding: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  proporcao: {
    width: "100%",
    aspectRatio: 9 / 19.5,
  },
  preencher: {
    // A altura vem do pai (flex) e a largura sai da proporção:
    // assim o celular fica no formato certo mesmo ocupando a tela.
    flex: 1,
    aspectRatio: 9 / 19.5,
  },
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 38,
    overflow: "hidden",
  },
  barraStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 34,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  hora: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#303030",
  },
  iconesStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  conteudo: {
    flex: 1,
  },
  notch: {
    position: "absolute",
    top: 10,
    left: "50%",
    marginLeft: -42,
    width: 84,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1A1A1A",
  },
  botaoLateral: {
    position: "absolute",
    left: -3,
    width: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3A",
  },
  botaoLateralDireito: {
    position: "absolute",
    right: -3,
    width: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3A",
  },
});
