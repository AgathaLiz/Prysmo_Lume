import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  HelpCircle,
  RotateCcw,
  Volume2,
  X,
  XCircle,
} from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";

import { BarraStatus } from "@/components/BarraStatus";
import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const MIMI = require("../assets/Lume/Mimi/Png/mimi-pra-baixo.png") as ImageSourcePropType;

/** Proporção original da arte da Mimi (423 x 563). */
const PROPORCAO_MIMI = 563 / 423;

/** Cores do mockup do quiz. */
const Cor = {
  branco: "#FFFFFF",
  quasePreto: "#1A1A1A",
  vermelhoX: "#E23B2E",
  vermelhoErrado: "#F0543C",
  verde: "#86DA68",
  painel: "#E9B8FF",
  botaoLilas: "#E9B8FF",
  botaoEscuro: "#333333",
  botaoEscuroIcone: "#F0E6F8",
  selecionado: "#F3E8FF",
  trilha: "#303030",
  knob: "#FFC08A",
  preenchimentoInicio: "#C77DFF",
  preenchimentoFim: "#FFC08A",
};

export type AlternativaQuiz = {
  id: number;
  texto: string;
};

type Props = {
  pergunta: string;
  alternativas: AlternativaQuiz[];
  selecionada: number | null;
  verificado: boolean;
  certaId: number | null;
  /** Índice 0-based da pergunta atual. */
  indice: number;
  total: number;
  verificando: boolean;
  erro: string;
  podeVoltar: boolean;
  vidas?: number;
  onSelecionar: (id: number) => void;
  onContinuar: () => void;
  onFechar: () => void;
  onAjuda: () => void;
  onOuvir: () => void;
  onVoltar: () => void;
  onRecomecar: () => void;
};

/**
 * Tela do quiz, seguindo o mockup das lições.
 *
 * Topo com o X, a Mimi e o painel "Precisa de algo?" (voltar, ouvir, ajuda e
 * recomeçar); a pergunta; as alternativas em pílulas com o círculo de rádio;
 * o botão "Continuar" e o rodapé com a etapa e a barra de progresso.
 *
 * A resposta certa fica verde e as erradas ficam vermelhas só depois de
 * verificar. Logo acima do botão "Continuar" uma linha avisa se a pessoa
 * acertou ou errou. Quem lê a tela ouve o mesmo: as pílulas avisam quando
 * estão certas ou erradas. A Mimi do topo é só a imagem decorativa: ela não
 * fala nem precisa ser tocada.
 *
 * As medidas saem da largura da tela. O painel "Precisa de algo?" fica na
 * parte de cima e as alternativas (pílulas pequenas) se distribuem por igual
 * na altura que sobra até o botão "Continuar", sem esticar; se o conteúdo não
 * couber, a área rola.
 */
export function QuizLicao({
  pergunta,
  alternativas,
  selecionada,
  verificado,
  certaId,
  indice,
  total,
  verificando,
  erro,
  podeVoltar,
  vidas,
  onSelecionar,
  onContinuar,
  onFechar,
  onAjuda,
  onOuvir,
  onVoltar,
  onRecomecar,
}: Props) {
  const { tema, fonte, escalaFonte } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();

  // Medidas tiradas do mockup, proporcionais à largura da tela.
  const margemTopo = Math.round(larguraTela * 0.045);
  const margem = Math.round(larguraTela * 0.085);
  const ladoX = Math.min(64, Math.round(larguraTela * 0.16));
  const espacoTopo = Math.round(larguraTela * 0.03);
  const larguraMimi = Math.round(larguraTela * 0.29);
  const alturaMimi = Math.round(larguraMimi * PROPORCAO_MIMI);
  const topoMimi = ladoX + Math.round(larguraTela * 0.03);
  const alturaTopo = topoMimi + alturaMimi;

  // O painel "Precisa de algo?" é a parte de cima da tela: ele estica na
  // largura que sobra do X/Mimi e ganha folga na vertical.
  const paddingPainel = Math.round(larguraTela * 0.05);
  const raioPainel = Math.round(larguraTela * 0.09);
  const ladoBotaoPainel = Math.round(larguraTela * 0.112);
  const espacoBotoesPainel = Math.round(larguraTela * 0.032);
  const iconePainel = Math.round(ladoBotaoPainel * 0.56);

  // As opções crescem junto com a preferência de tamanho de fonte
  // ("Pequena" 1x, "Média" 1.15x, "Grande" 1.35x): quem precisa de letra maior
  // também ganha pílulas maiores, com mais área para tocar.
  const alturaPilula = Math.round(larguraTela * 0.175 * escalaFonte);
  const ladoCirculo = Math.round(larguraTela * 0.07 * escalaFonte);
  const espacoPilulas = Math.round(larguraTela * 0.026 * escalaFonte);
  const espacoInternoPilula = Math.round(larguraTela * 0.04 * escalaFonte);

  const alturaBotao = Math.min(84, Math.round(larguraTela * 0.2));
  const alturaTrilha = Math.round(larguraTela * 0.038);
  const tamanhoKnob = Math.round(alturaTrilha * 1.25);

  // O rótulo do rodapé sobe junto com a resposta, como nas imagens.
  const etapaAtual = indice + (verificado ? 1 : 0);
  const progresso = total > 0 ? Math.min(1, etapaAtual / total) : 0;
  const mostrarProgresso = progresso > 0;

  const botoesPainel = [
    {
      chave: "voltar",
      icone: <ArrowLeft size={iconePainel} color={Cor.quasePreto} />,
      rotulo: "Voltar para a etapa anterior",
      tocar: onVoltar,
      desabilitado: !podeVoltar,
      escuro: false,
    },
    {
      chave: "ouvir",
      icone: <Volume2 size={iconePainel} color={Cor.quasePreto} />,
      rotulo: "Ouvir a pergunta e as opções",
      tocar: onOuvir,
      desabilitado: false,
      escuro: false,
    },
    {
      chave: "ajuda",
      icone: <HelpCircle size={iconePainel} color={Cor.botaoEscuroIcone} />,
      rotulo: "Abrir ajuda",
      tocar: onAjuda,
      desabilitado: false,
      escuro: true,
    },
    {
      chave: "recomecar",
      icone: <RotateCcw size={iconePainel} color={Cor.quasePreto} />,
      rotulo: "Recomeçar o quiz",
      tocar: onRecomecar,
      desabilitado: false,
      escuro: false,
    },
  ];

  const dicaContinuar = verificado
    ? "Avança para a próxima etapa"
    : "Verifica a resposta escolhida";

  // Feedback logo acima do botão: a Mimi é só a imagem do topo, quem avisa se
  // acertou ou errou é esta linha (visual e para quem usa leitor de tela).
  const acertou =
    verificado && selecionada !== null && certaId !== null && selecionada === certaId;
  const errou =
    verificado && selecionada !== null && certaId !== null && selecionada !== certaId;
  const iconeFeedback = Math.round(fonte(17) * 1.25);

  return (
    <View style={styles.tela}>
      <BarraStatus />

      <View style={styles.conteudo}>
        <View style={[styles.topo, { minHeight: alturaTopo }]}>
          <TouchableOpacity
            onPress={onFechar}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sair da lição"
            accessibilityHint="Pede confirmação antes de sair"
            style={[
              styles.botaoFechar,
              {
                width: ladoX,
                height: ladoX,
                borderRadius: Math.round(ladoX * 0.28),
                left: margemTopo,
              },
            ]}
          >
            <X size={Math.round(ladoX * 0.6)} color={Cor.quasePreto} strokeWidth={3.5} />
          </TouchableOpacity>

          <View
            style={[
              styles.painel,
              {
                marginLeft: margemTopo + ladoX + espacoTopo,
                marginRight: margemTopo,
                marginTop: Math.round(larguraTela * 0.045),
                borderRadius: raioPainel,
                paddingHorizontal: paddingPainel,
                paddingVertical: Math.round(paddingPainel * 1.5),
              },
            ]}
          >
            <Text style={[styles.tituloPainel, { fontSize: fonte(17) }]}>
              Precisa de algo?
            </Text>

            <View
              style={[
                styles.painelBotoes,
                {
                  borderRadius: Math.round(raioPainel * 0.7),
                  padding: Math.round(paddingPainel * 0.5),
                  gap: espacoBotoesPainel,
                  marginTop: Math.round(paddingPainel * 0.6),
                },
              ]}
            >
              {botoesPainel.map((botao) => (
                <TouchableOpacity
                  key={botao.chave}
                  onPress={botao.tocar}
                  disabled={botao.desabilitado}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={botao.rotulo}
                  hitSlop={6}
                  style={[
                    styles.botaoPainel,
                    {
                      width: ladoBotaoPainel,
                      height: ladoBotaoPainel,
                      borderRadius: Math.round(ladoBotaoPainel * 0.34),
                      backgroundColor: botao.escuro
                        ? Cor.botaoEscuro
                        : Cor.botaoLilas,
                      opacity: botao.desabilitado ? 0.45 : 1,
                    },
                  ]}
                >
                  {botao.icone}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Image
            source={MIMI}
            accessible={false}
            resizeMode="contain"
            style={[
              styles.mimi,
              {
                top: topoMimi,
                left: margemTopo,
                width: larguraMimi,
                height: alturaMimi,
              },
            ]}
          />
        </View>

        {typeof vidas === "number" ? (
          <View
            style={[styles.linhaVidas, { paddingRight: margem }]}
            accessible
            accessibilityLabel={`${vidas} de 3 vidas restantes`}
          >
            {[0, 1, 2].map((i) => {
              const ativa = i < vidas;
              return (
                <Heart
                  key={i}
                  size={28}
                  color={ativa ? "#E23B2E" : "#C9C5C6"}
                  fill={ativa ? "#E23B2E" : "#EAE6ED"}
                  strokeWidth={2.2}
                />
              );
            })}
          </View>
        ) : null}

        <ScrollView
          style={styles.rolagem}
          contentContainerStyle={[
            styles.conteudoPergunta,
            { paddingHorizontal: margem },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text
            accessibilityRole="header"
            style={[styles.pergunta, { fontSize: fonte(18), lineHeight: fonte(18) * 1.3 }]}
          >
            {pergunta}
          </Text>

          <View
            accessibilityRole="radiogroup"
            style={[styles.opcoes, { gap: espacoPilulas, paddingTop: espacoPilulas }]}
          >
            {alternativas.map((alternativa) => {
              const escolhida = selecionada === alternativa.id;
              const certa = verificado && alternativa.id === certaId;
              const errada =
                verificado && certaId !== null && alternativa.id !== certaId;

              const rotulo = certa
                ? `${alternativa.texto}. Resposta correta.`
                : errada
                  ? `${alternativa.texto}. Resposta incorreta.`
                  : alternativa.texto;

              return (
                <TouchableOpacity
                  key={alternativa.id}
                  onPress={() => onSelecionar(alternativa.id)}
                  disabled={verificado || verificando}
                  activeOpacity={0.85}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: escolhida,
                    disabled: verificado || verificando,
                  }}
                  accessibilityLabel={rotulo}
                  style={[
                    styles.alternativa,
                    {
                      minHeight: alturaPilula,
                      borderRadius: alturaPilula / 2,
                      paddingHorizontal: espacoInternoPilula,
                      gap: espacoInternoPilula,
                    },
                    escolhida &&
                      !verificado && { backgroundColor: Cor.selecionado },
                    certa && { backgroundColor: Cor.verde },
                    errada && { backgroundColor: Cor.vermelhoErrado },
                  ]}
                >
                  <View
                    style={[
                      styles.circulo,
                      {
                        width: ladoCirculo,
                        height: ladoCirculo,
                        borderRadius: ladoCirculo / 2,
                      },
                    ]}
                  >
                    {escolhida && !verificado && (
                      <View
                        style={[
                          styles.circuloDentro,
                          {
                            width: ladoCirculo * 0.5,
                            height: ladoCirculo * 0.5,
                            borderRadius: ladoCirculo * 0.25,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.textoAlternativa,
                      { fontSize: fonte(17), lineHeight: fonte(17) * 1.3 },
                    ]}
                  >
                    {alternativa.texto}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.acoes, { paddingHorizontal: margemTopo }]}>
          {acertou && (
            <View
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel="Você acertou a resposta"
              style={styles.feedback}
            >
              <CheckCircle2 size={iconeFeedback} color={tema.sucesso} />
              <Text
                style={[
                  styles.textoFeedback,
                  { color: tema.sucesso, fontSize: fonte(17) },
                ]}
              >
                Muito bem! Você acertou.
              </Text>
            </View>
          )}

          {errou && (
            <View
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel="Você errou. A resposta certa está em verde"
              style={styles.feedback}
            >
              <XCircle size={iconeFeedback} color={tema.erro} />
              <Text
                style={[
                  styles.textoFeedback,
                  { color: tema.erro, fontSize: fonte(17) },
                ]}
              >
                Não foi essa. A resposta certa está em verde.
              </Text>
            </View>
          )}

          {erro !== "" && (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.erro, { fontSize: fonte(17) }]}
            >
              {erro}
            </Text>
          )}

          <BotaoGrande
            titulo={verificando ? "Verificando..." : "Continuar"}
            variante="roxo"
            desabilitado={verificando}
            descricaoAcessivel={dicaContinuar}
            onPress={onContinuar}
            estilo={{
              minHeight: alturaBotao,
              borderRadius: Math.round(alturaBotao * 0.45),
            }}
          />
        </View>

        <View style={[styles.rodape, { paddingHorizontal: margem }]}>
          <Text style={[styles.textoEtapa, { fontSize: fonte(13) }]}>
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
            {mostrarProgresso && (
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
                  colors={[Cor.preenchimentoInicio, Cor.preenchimentoFim]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.preenchimentoGradiente}
                />
              </View>
            )}

            {mostrarProgresso && (
              <View
                style={[
                  styles.knob,
                  {
                    left: `${progresso * 100}%`,
                    width: tamanhoKnob,
                    height: tamanhoKnob,
                    borderRadius: tamanhoKnob / 2,
                    marginLeft: -tamanhoKnob / 2,
                    top: -(tamanhoKnob - alturaTrilha) / 2,
                  },
                ]}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cor.branco,
  },
  conteudo: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 6,
  },
  topo: {
    position: "relative",
  },
  botaoFechar: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 3,
    backgroundColor: Cor.vermelhoX,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  painel: {
    backgroundColor: Cor.painel,
    zIndex: 1,
    shadowColor: "#5A1A78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  tituloPainel: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.quasePreto,
  },
  painelBotoes: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Cor.branco,
  },
  botaoPainel: {
    alignItems: "center",
    justifyContent: "center",
  },
  mimi: {
    position: "absolute",
    zIndex: 2,
  },
  rolagem: {
    flex: 1,
  },
  conteudoPergunta: {
    flexGrow: 1,
    paddingTop: 2,
  },
  pergunta: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.quasePreto,
  },
  opcoes: {
    flexGrow: 1,
    justifyContent: "space-evenly",
    paddingBottom: 8,
  },
  alternativa: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Cor.branco,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  circulo: {
    borderWidth: 2.5,
    borderColor: Cor.quasePreto,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  circuloDentro: {
    backgroundColor: Cor.quasePreto,
  },
  textoAlternativa: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: Cor.quasePreto,
  },
  acoes: {
    paddingBottom: 4,
    gap: 6,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textoFeedback: {
    flexShrink: 1,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  erro: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#C04B4B",
    textAlign: "center",
  },
  rodape: {
    paddingBottom: 6,
  },
  textoEtapa: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.quasePreto,
  },
  trilha: {
    backgroundColor: Cor.trilha,
    justifyContent: "center",
  },
  preenchimento: {
    height: "100%",
    overflow: "hidden",
  },
  preenchimentoGradiente: {
    flex: 1,
  },
  knob: {
    position: "absolute",
    backgroundColor: Cor.knob,
  },
  linhaVidas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: -6,
    marginBottom: 4,
  },
});
