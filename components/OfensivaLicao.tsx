import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";

import { BarraStatus } from "@/components/BarraStatus";
import { BotaoGradiente } from "@/components/BotaoGradiente";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const LUZ = require("../assets/Lume/Outros elementos/Png/luz-acesa.png") as ImageSourcePropType;
const ESTRELA = require("../assets/Lume/Outros elementos/Png/estrela-cinco-pontas.png") as ImageSourcePropType;

/** Quantos dias o cartão mostra, como no mockup. */
const DIAS_NO_CARTAO = 5;

/** Cores do mockup da tela de ofensiva. */
const Cor = {
  branco: "#FFFFFF",
  texto: "#303030",
  estrelaAcesa: "#FFD651",
  estrelaApagada: "#D9D9D9",
};

function doisDigitos(valor: number): string {
  return valor < 10 ? `0${valor}` : `${valor}`;
}

/** Data curta (dd/mm) para o rótulo de cada dia. */
function dataCurta(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

/** Os últimos N dias terminando hoje, do mais antigo para o mais recente. */
function ultimosDias(quantidade: number): Date[] {
  const hoje = new Date();
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (quantidade - 1 - indice));
    return data;
  });
}

type Props = {
  /** Dias seguidos de estudo (ofensiva). */
  dias: number;
  onContinuar: () => void;
};

/**
 * Tela de ofensiva no fim da lição, fiel ao mockup: a luz acesa, o título e o
 * cartão com os últimos dias (dd/mm) e uma estrela para cada dia estudado.
 *
 * Como o servidor só informa a quantidade de dias seguidos, acendemos as
 * estrelas dos dias mais recentes até hoje. Quem lê a tela ouve o resumo.
 */
export function OfensivaLicao({ dias, onContinuar }: Props) {
  const { fonte } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();

  const margem = Math.round(larguraTela * 0.05);
  /** Folga abaixo do botão: o mockup deixa o "Continuar" uns 30 px mais para cima. */
  const folgaBotao = Math.round(larguraTela * 0.06) + 30;
  const larguraLuz = Math.min(340, Math.round(larguraTela * 0.8));
  const ladoEstrela = Math.round(larguraTela * 0.11);
  const alturaBotao = Math.min(96, Math.round(larguraTela * 0.24));
  const raioBotao = Math.round(alturaBotao * 0.42);

  const diasSeguidos = Math.max(1, dias);
  const acesos = Math.min(diasSeguidos, DIAS_NO_CARTAO);
  const listaDias = ultimosDias(DIAS_NO_CARTAO);

  return (
    <View style={styles.tela}>
      <BarraStatus />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          {
            paddingHorizontal: margem,
            paddingBottom: folgaBotao,
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={LUZ}
          style={{ width: larguraLuz, height: larguraLuz }}
          resizeMode="contain"
          accessible={false}
        />

        <Text
          accessibilityRole="header"
          style={[styles.titulo, { fontSize: fonte(24) }]}
        >
          Dias de Ofensiva
        </Text>

        <View
          accessible
          accessibilityLabel={`Ofensiva de ${diasSeguidos} ${
            diasSeguidos === 1 ? "dia" : "dias"
          } seguidos de estudo.`}
          style={styles.cartao}
        >
          {listaDias.map((data, indice) => {
            const acesa = indice >= DIAS_NO_CARTAO - acesos;

            return (
              <View key={indice} style={styles.dia}>
                <Text style={[styles.rotuloDia, { fontSize: fonte(12) }]}>
                  {dataCurta(data)}
                </Text>

                <Image
                  source={ESTRELA}
                  style={{
                    width: ladoEstrela,
                    height: ladoEstrela,
                    tintColor: acesa ? Cor.estrelaAcesa : Cor.estrelaApagada,
                  }}
                  resizeMode="contain"
                  accessible={false}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.espaco} />

        <BotaoGradiente
          titulo="Continuar"
          altura={alturaBotao}
          raio={raioBotao}
          descricaoAcessivel="Voltar para a trilha"
          onPress={onContinuar}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cor.branco,
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    alignItems: "center",
    paddingTop: 10,
    gap: 14,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.texto,
    textAlign: "center",
  },
  cartao: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Cor.branco,
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  dia: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  rotuloDia: {
    fontFamily: "Poppins_600SemiBold",
    color: Cor.texto,
  },
  /** Empurra o "Continuar" para o fim da tela, como no mockup. */
  espaco: {
    flex: 1,
    minHeight: 8,
  },
});
