import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, ChevronRight, XCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";

import { BarraStatus } from "@/components/BarraStatus";
import { GRADIENTE_LICAO } from "@/components/BotaoGradiente";
import { MolduraCelular } from "@/components/MolduraCelular";
import { TelasFicticias } from "@/components/simulador/TelasFicticias";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  telaDoAlvo,
  type CenarioSimulacao,
  type TelaFicticia,
} from "@/lib/simulacao";

const MIMI = require("../assets/Lume/Mimi/Png/mimi-sorrindo.png") as ImageSourcePropType;

/** Largura dividida pela altura da Mimi (a imagem tem 157 x 219). */
const PROPORCAO_MIMI = 157 / 219;

type Props = {
  cenario: CenarioSimulacao;
  /** Recebe quantos erros a pessoa cometeu (usado na nota). */
  onFinalizar: (erros: number) => void;
  /** Volta para a etapa anterior da lição (botão redondo do mockup). */
  onVoltar?: () => void;
  /** Ocupa toda a altura disponível (o celular preenche a tela). */
  preencher?: boolean;
};

type Feedback = { tipo: "acerto" | "erro"; texto: string } | null;

const PROPORCAO_TELEFONE = 9 / 19.5;
const LARGURA_MAXIMA_TELEFONE = 340;
/** Altura fixa do rodapé para o celular não mudar de tamanho entre passos. */
const ALTURA_RODAPE = 58;
const COR_TRILHA = "#303030";
const COR_TEXTO = "#1A1A1A";

/**
 * Celular de mentirinha da simulação.
 *
 * O desenho segue o mockup: um cartão no topo com a Mimi e o que fazer agora,
 * o botão redondo de voltar à esquerda e, embaixo, "Etapa X de N" com a barra
 * de progresso em gradiente. O aparelho no meio é o mesmo de sempre.
 *
 * Errar não pune: mostra a dica no cartão e deixa tentar de novo.
 */
export function SimuladorCelular({
  cenario,
  onFinalizar,
  onVoltar,
  preencher = false,
}: Props) {
  const { tema, fonte, audioDescricao, falar, pararFala } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();

  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [travado, setTravado] = useState(false);
  const [espacoTelefone, setEspacoTelefone] = useState({
    width: 0,
    height: 0,
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passo = cenario.passos[indice];
  const total = cenario.passos.length;

  // Medidas proporcionais à largura da tela, como nas outras telas da lição.
  const margem = Math.round(larguraTela * 0.05);
  const alturaTrilha = Math.round(larguraTela * 0.03);
  const ladoChevron = Math.min(58, Math.round(larguraTela * 0.15));
  const iconeChevron = Math.round(ladoChevron * 0.52);
  const larguraMimi = Math.round(larguraTela * 0.15);
  const alturaMimi = Math.round(larguraMimi / PROPORCAO_MIMI);
  const iconeFeedback = Math.round(larguraTela * 0.055);

  // Limpa o timer e cala a Mimi ao sair da tela.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      pararFala();
    };
  }, [pararFala]);

  // A Mimi só fala sozinha quando a audio-descrição está ligada nas
  // preferências. Quem quiser ouvir fora disso toca no cartão da instrução.
  useEffect(() => {
    if (!audioDescricao || !passo) return;
    falar(passo.instrucao);
  }, [audioDescricao, passo, falar]);

  function aoTocar(alvo: string) {
    if (travado || !passo) return;

    // Errou: conta o erro, mostra a dica e continua no mesmo passo.
    if (alvo !== passo.alvo) {
      const proximosErros = erros + 1;
      const texto =
        passo.dica ?? "Não foi esse. Toque no que está brilhando na tela.";
      setErros(proximosErros);
      setFeedback({ tipo: "erro", texto });
      AccessibilityInfo.announceForAccessibility(`Não foi esse. ${texto}`);
      if (audioDescricao) falar(`Não foi esse. ${texto}`);
      return;
    }

    // Acertou.
    setFeedback({ tipo: "acerto", texto: "Muito bem!" });
    AccessibilityInfo.announceForAccessibility("Muito bem!");
    if (audioDescricao) falar("Muito bem!");
    setTravado(true);

    timer.current = setTimeout(() => {
      if (indice >= total - 1) {
        onFinalizar(erros);
        return;
      }
      setIndice((atual) => atual + 1);
      setFeedback(null);
      setTravado(false);
    }, 1300);
  }

  if (!passo) return null;

  const tela: TelaFicticia =
    (passo.tela as TelaFicticia | undefined) ??
    telaDoAlvo(passo.alvo) ??
    (cenario.tela as TelaFicticia | undefined) ??
    "home";

  // O celular precisa caber tanto na largura quanto na altura disponíveis.
  // Assim ele não estoura a tela em aparelhos estreitos nem em telas baixas.
  const larguraDisponivel = Math.max(0, espacoTelefone.width - 8);
  const alturaDisponivel = Math.max(0, espacoTelefone.height - 8);
  const larguraTelefone = Math.min(
    larguraDisponivel,
    alturaDisponivel * PROPORCAO_TELEFONE,
    LARGURA_MAXIMA_TELEFONE
  );
  const alturaTelefone = larguraTelefone / PROPORCAO_TELEFONE;
  const telefoneMedido = larguraTelefone > 0 && alturaTelefone > 0;

  // O botão de voltar acompanha o topo do celular, como no mockup.
  const topoTelefone = Math.max(
    0,
    (espacoTelefone.height - alturaTelefone) / 2
  );
  const topoChevron = Math.round(topoTelefone + alturaTelefone * 0.08);

  const etapaAtual = indice + 1;
  const progresso = total > 0 ? etapaAtual / total : 0;

  const textoParaOuvir = feedback
    ? feedback.tipo === "acerto"
      ? "Muito bem!"
      : `Não foi esse. ${feedback.texto}`
    : passo.instrucao;

  return (
    <View style={[styles.container, preencher && styles.containerPreencher]}>
      <BarraStatus />

      <View style={[styles.corpo, { paddingHorizontal: margem }]}>
        {/* Cartão de instrução: a Mimi e o que fazer agora. Tocar nele
            repete a fala, para quem não usa a audio-descrição. */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            pararFala();
            falar(textoParaOuvir);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Instrução: ${textoParaOuvir}`}
          accessibilityHint="Toque para ouvir de novo"
          style={[
            styles.cartao,
            { backgroundColor: tema.cartao, borderColor: tema.borda },
          ]}
        >
          <Image
            source={MIMI}
            style={{ width: larguraMimi, height: alturaMimi }}
            resizeMode="contain"
          />

          <View style={styles.cartaoTexto}>
            {feedback ? (
              <>
                <View style={styles.linhaFeedback}>
                  {feedback.tipo === "acerto" ? (
                    <CheckCircle2 size={iconeFeedback} color={tema.sucesso} />
                  ) : (
                    <XCircle size={iconeFeedback} color={tema.erro} />
                  )}
                  <Text
                    style={[
                      styles.textoInstrucao,
                      {
                        color:
                          feedback.tipo === "acerto" ? tema.sucesso : tema.erro,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    {feedback.tipo === "acerto" ? "Muito bem!" : "Não foi esse."}
                  </Text>
                </View>

                {feedback.tipo === "erro" && (
                  <Text
                    style={[
                      styles.textoDica,
                      { color: tema.texto, fontSize: fonte(14) },
                    ]}
                  >
                    {feedback.texto} Toque de novo. Não tem pressa.
                  </Text>
                )}
              </>
            ) : (
              <Text
                style={[
                  styles.textoInstrucao,
                  { color: COR_TEXTO, fontSize: fonte(16) },
                ]}
              >
                <InstrucaoMarcada texto={passo.instrucao} />
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.areaCelular}>
          <View
            style={styles.areaTelefone}
            onLayout={(evento) => {
              const { width, height } = evento.nativeEvent.layout;
              setEspacoTelefone((atual) => {
                if (
                  Math.abs(atual.width - width) < 1 &&
                  Math.abs(atual.height - height) < 1
                ) {
                  return atual;
                }
                return { width, height };
              });
            }}
          >
            {telefoneMedido && (
              <MolduraCelular
                semBarraStatus
                tamanho={{ width: larguraTelefone, height: alturaTelefone }}
              >
                <ScrollView
                  style={styles.rolagem}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <TelasFicticias
                    tela={tela}
                    alvoAtual={passo.alvo}
                    onToque={aoTocar}
                    desabilitado={travado}
                  />
                </ScrollView>
              </MolduraCelular>
            )}
          </View>

          {onVoltar && (
            <TouchableOpacity
              onPress={onVoltar}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a etapa anterior"
              style={[
                styles.chevron,
                {
                  top: topoChevron,
                  width: ladoChevron,
                  height: ladoChevron,
                  borderRadius: ladoChevron / 2,
                  backgroundColor: tema.cartao,
                  borderColor: tema.borda,
                },
              ]}
            >
              <ChevronRight size={iconeChevron} color={tema.texto} />
            </TouchableOpacity>
          )}
        </View>

        {/* Rodapé fixo: "Etapa X de N" com a barra de progresso. */}
        <View style={[styles.rodape, { height: ALTURA_RODAPE }]}>
          <Text
            style={[
              styles.textoEtapa,
              { color: COR_TEXTO, fontSize: fonte(13) },
            ]}
          >
            Etapa {etapaAtual} de {total}
          </Text>

          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Etapa ${etapaAtual} de ${total}`}
            accessibilityValue={{ min: 0, max: total, now: etapaAtual }}
            style={[
              styles.trilha,
              {
                height: alturaTrilha,
                borderRadius: alturaTrilha / 2,
                marginTop: Math.round(larguraTela * 0.02),
              },
            ]}
          >
            <View
              style={[
                styles.preenchimento,
                {
                  width: `${progresso * 100}%`,
                  borderRadius: alturaTrilha / 2,
                },
              ]}
            >
              <LinearGradient
                colors={GRADIENTE_LICAO}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.preenchimentoGradiente}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Instrução com trechos destacados.
 *
 * O conteúdo marca o que importa entre `**`: esses pedaços ficam em roxo,
 * como no mockup, e o resto fica no tom do texto.
 */
function InstrucaoMarcada({ texto }: { texto: string }) {
  const { tema } = useAcessibilidade();
  const partes = texto.split("**");

  return (
    <>
      {partes.map((parte, posicao) =>
        posicao % 2 === 1 ? (
          <Text key={posicao} style={[styles.destaque, { color: tema.roxoEscuro }]}>
            {parte}
          </Text>
        ) : (
          <Text key={posicao}>{parte}</Text>
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  containerPreencher: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  corpo: {
    flex: 1,
    minHeight: 0,
  },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cartaoTexto: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  linhaFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textoInstrucao: {
    fontFamily: "Poppins_800ExtraBold",
  },
  destaque: {
    fontFamily: "Poppins_800ExtraBold",
  },
  textoDica: {
    fontFamily: "Poppins_600SemiBold",
  },
  areaCelular: {
    flex: 1,
    minHeight: 0,
  },
  areaTelefone: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    position: "absolute",
    left: 0,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  rolagem: {
    flex: 1,
  },
  rodape: {
    justifyContent: "center",
  },
  textoEtapa: {
    fontFamily: "Poppins_800ExtraBold",
  },
  trilha: {
    backgroundColor: COR_TRILHA,
    justifyContent: "center",
  },
  preenchimento: {
    height: "100%",
    overflow: "hidden",
  },
  preenchimentoGradiente: {
    flex: 1,
  },
});
