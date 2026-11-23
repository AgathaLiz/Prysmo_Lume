import {
  ActivityIndicator,
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
import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

/** A Mimi olhando para baixo, como no mockup. */
const MIMI = require("../assets/Lume/Mimi/Png/mimi-pra-baixo.png") as ImageSourcePropType;

/** Cores do mockup da tela de resultado. */
const Cor = {
  branco: "#FFFFFF",
  texto: "#303030",
  moldura: "#A855F7",
  cartaoAcertos: "#FFD14F",
  cartaoXp: "#C77DFF",
  secundario: "#8A8080",
  erro: "#C04B4B",
};

type Props = {
  aprovado: boolean;
  /** Se a lição tem questionário (senão mostra a nota em vez dos acertos). */
  comQuestoes: boolean;
  acertos: number;
  totalQuestoes: number;
  nota: number;
  xp: number;
  salvando: boolean;
  erro: string;
  conquistas: string[];
  exemplo: boolean;
  /** Verdadeiro quando o XP desta lição já tinha sido ganho antes. */
  xpJaGanho: boolean;
  temVideo: boolean;
  onContinuar: () => void;
  onTentarDeNovo: () => void;
  onVerVideo: () => void;
  onSalvarDeNovo: () => void;
};

/**
 * Tela de fim de lição (aprovado ou não), fiel ao mockup: a Mimi em destaque
 * (sem moldura), o título, os cartões de acertos e de XP e o botão "Continuar"
 * com fundo em gradiente.
 *
 * Quem ganhou XP vê "+N"; quem já tinha ganho vê o aviso. Enquanto o servidor
 * grava, o XP aparece como "...". Tudo dimensionado pela largura da tela, para
 * bater com o mockup em qualquer aparelho e crescer junto com a fonte escolhida.
 */
export function ResultadoLicao({
  aprovado,
  comQuestoes,
  acertos,
  totalQuestoes,
  nota,
  xp,
  salvando,
  erro,
  conquistas,
  exemplo,
  xpJaGanho,
  temVideo,
  onContinuar,
  onTentarDeNovo,
  onVerVideo,
  onSalvarDeNovo,
}: Props) {
  const { fonte } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();

  const margem = Math.round(larguraTela * 0.05);
  /** Folga abaixo do botão: o mockup deixa o "Continuar" uns 30 px mais para cima. */
  const folgaBotao = Math.round(larguraTela * 0.06) + 30;
  const larguraMoldura = Math.min(300, Math.round(larguraTela * 0.62));
  const alturaMoldura = Math.round(larguraMoldura * 1.05);
  const raioMoldura = Math.round(larguraTela * 0.1);

  const espacoCartoes = Math.round(larguraTela * 0.035);
  const alturaCartao = Math.round(larguraTela * 0.31);
  const raioCartao = Math.round(larguraTela * 0.085);
  const paddingCartao = Math.round(larguraTela * 0.028);
  const raioCaixa = Math.round(larguraTela * 0.055);

  const alturaBotao = Math.min(96, Math.round(larguraTela * 0.24));
  const raioBotao = Math.round(alturaBotao * 0.42);

  const cartoes = [
    {
      chave: "acertos",
      rotulo: comQuestoes ? "Acertos" : "Nota",
      valor: comQuestoes ? `${acertos}/${totalQuestoes}` : `${nota}%`,
      fundo: Cor.cartaoAcertos,
    },
    {
      chave: "xp",
      rotulo: "XP",
      valor: salvando ? "..." : `+${xp}`,
      fundo: Cor.cartaoXp,
    },
  ];

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
        <View
          style={[
            styles.moldura,
            {
              width: larguraMoldura,
              height: alturaMoldura,
              borderRadius: raioMoldura,
              padding: Math.round(larguraTela * 0.02),
            },
          ]}
        >
          <Image
            source={MIMI}
            style={styles.mimi}
            resizeMode="contain"
            accessible={false}
          />
        </View>

        <Text
          accessibilityRole="header"
          style={[styles.titulo, { fontSize: fonte(26) }]}
        >
          {aprovado ? "Muito Bem!" : "Quase lá!"}
        </Text>

        <View style={[styles.linhaCartoes, { gap: espacoCartoes }]}>
          {cartoes.map((cartao) => (
            <View
              key={cartao.chave}
              accessible
              accessibilityLabel={`${cartao.rotulo}: ${cartao.valor}`}
              style={[
                styles.cartao,
                {
                  minHeight: alturaCartao,
                  borderRadius: raioCartao,
                  padding: paddingCartao,
                  backgroundColor: cartao.fundo,
                },
              ]}
            >
              <Text style={[styles.rotuloCartao, { fontSize: fonte(17) }]}>
                {cartao.rotulo}
              </Text>

              <View
                style={[
                  styles.caixaCartao,
                  { borderRadius: raioCaixa, paddingVertical: paddingCartao },
                ]}
              >
                <Text style={[styles.valorCartao, { fontSize: fonte(26) }]}>
                  {cartao.valor}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {conquistas.length > 0 && (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.aviso, { backgroundColor: Cor.cartaoAcertos }]}
          >
            <Text style={[styles.textoAviso, { fontSize: fonte(16) }]}>
              {conquistas.length === 1 ? "Nova conquista: " : "Novas conquistas: "}
              {conquistas.join(", ")}
            </Text>
          </View>
        )}

        {aprovado && xpJaGanho && (
          <Text
            style={[styles.secundario, { fontSize: fonte(16) }]}
          >
            Você já tinha ganhado o XP desta lição.
          </Text>
        )}

        {exemplo && (
          <Text style={[styles.secundario, { fontSize: fonte(15) }]}>
            Lição de exemplo: o resultado não é salvo.
          </Text>
        )}

        {salvando && (
          <View style={styles.linhaSalvando}>
            <ActivityIndicator size="small" color={Cor.moldura} />
            <Text style={[styles.secundario, { fontSize: fonte(16) }]}>
              Salvando seu resultado...
            </Text>
          </View>
        )}

        <View style={styles.espaco} />

        {erro !== "" && (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.erro, { fontSize: fonte(17) }]}
          >
            {erro}
          </Text>
        )}

        {aprovado ? (
          <BotaoGradiente
            titulo={salvando ? "Salvando..." : "Continuar"}
            desabilitado={erro !== ""}
            altura={alturaBotao}
            raio={raioBotao}
            onPress={onContinuar}
          />
        ) : (
          <>
            <BotaoGradiente
              titulo="Tentar de novo"
              altura={alturaBotao}
              raio={raioBotao}
              onPress={onTentarDeNovo}
            />
            {temVideo && (
              <BotaoGrande
                titulo="Ver o vídeo de novo"
                variante="contorno"
                onPress={onVerVideo}
              />
            )}
          </>
        )}

        {erro !== "" && (
          <BotaoGrande
            titulo="Tentar salvar de novo"
            variante="contorno"
            carregando={salvando}
            onPress={onSalvarDeNovo}
          />
        )}
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
    paddingTop: 8,
    gap: 12,
  },
  moldura: {
    backgroundColor: Cor.branco,
    alignItems: "center",
    justifyContent: "center",
  },
  mimi: {
    width: "100%",
    height: "100%",
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.texto,
    textAlign: "center",
  },
  linhaCartoes: {
    flexDirection: "row",
    alignItems: "stretch",
    alignSelf: "stretch",
  },
  cartao: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  rotuloCartao: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.texto,
  },
  caixaCartao: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: Cor.branco,
    paddingHorizontal: 8,
  },
  valorCartao: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.texto,
  },
  aviso: {
    alignSelf: "stretch",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  textoAviso: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#32064F",
    textAlign: "center",
  },
  secundario: {
    fontFamily: "Poppins_600SemiBold",
    color: Cor.secundario,
    textAlign: "center",
  },
  linhaSalvando: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  erro: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.erro,
    textAlign: "center",
  },
  /** Empurra o "Continuar" para o fim da tela, como no mockup. */
  espaco: {
    flex: 1,
    minHeight: 8,
  },
});
