import {
  CheckCircle2,
  RefreshCw,
  Volume2,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MolduraCelular } from "@/components/MolduraCelular";
import { TelasFicticias } from "@/components/simulador/TelasFicticias";
import { TutorialMimi } from "@/components/TutorialMimi";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  telaDoAlvo,
  type CenarioSimulacao,
  type TelaFicticia,
} from "@/lib/simulacao";

type Props = {
  cenario: CenarioSimulacao;
  /** Recebe quantos erros a pessoa cometeu (usado na nota). */
  onFinalizar: (erros: number) => void;
  /** Ocupa toda a altura disponível (o celular preenche a tela). */
  preencher?: boolean;
};

type Feedback = { tipo: "acerto" | "erro"; texto: string } | null;

/**
 * Celular de mentirinha.
 *
 * O aparelho fica na parte de cima da tela e o elemento certo recebe uma
 * borda/brilho. A instrução do passo vira a fala da Mimi, que fica logo
 * abaixo do celular (se sobrepondo de leve à moldura) para ficar bem
 * legível. Errar não pune: mostra a dica e deixa tentar de novo.
 */
export function SimuladorCelular({
  cenario,
  onFinalizar,
  preencher = false,
}: Props) {
  const { tema, fonte, audioDescricao, falar, pararFala } = useAcessibilidade();

  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [travado, setTravado] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passo = cenario.passos[indice];
  const total = cenario.passos.length;

  // Limpa o timer e cala a Mimi ao sair da tela.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      pararFala();
    };
  }, [pararFala]);

  // A Mimi lê a instrução de cada passo em voz alta, por conta própria.
  useEffect(() => {
    if (!passo) return;
    falar(passo.instrucao);
  }, [passo, falar]);

  const recomecar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    pararFala();
    setIndice(0);
    setErros(0);
    setFeedback(null);
    setTravado(false);
  }, [pararFala]);

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

  return (
    <View style={[styles.container, preencher && styles.containerPreencher]}>
      <View style={styles.areaCelular}>
        {/* Celular mais curto para a Mimi caber embaixo sem cobrir a tela. */}
        <View style={styles.areaTelefone}>
          <MolduraCelular preencher semBarraStatus>
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
        </View>

        {/* Rodapé da Mimi: fica fora do celular e se sobrepõe de leve. */}
        <View style={styles.rodape}>
          <View
            style={styles.areaMimi}
            pointerEvents="none"
          >
            {feedback ? (
              <View
                style={[
                  styles.feedback,
                  {
                    backgroundColor:
                      feedback.tipo === "acerto"
                        ? tema.sucessoFundo
                        : tema.erroFundo,
                  },
                ]}
                accessibilityLiveRegion="polite"
              >
                {feedback.tipo === "acerto" ? (
                  <CheckCircle2 size={24} color={tema.sucesso} />
                ) : (
                  <XCircle size={24} color={tema.erro} />
                )}
                <View style={styles.feedbackTextos}>
                  <Text
                    style={[
                      styles.textoFeedback,
                      {
                        color:
                          feedback.tipo === "acerto" ? tema.sucesso : tema.erro,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    {feedback.texto}
                  </Text>
                  {feedback.tipo === "erro" && (
                    <Text
                      style={[
                        styles.dica,
                        { color: tema.textoSecundario, fontSize: fonte(13) },
                      ]}
                    >
                      Toque de novo. Não tem pressa.
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <TutorialMimi
                fala={passo.instrucao}
                titulo={`Passo ${indice + 1} de ${total}`}
                pose="esquerda"
              />
            )}
          </View>

          <View style={styles.controleLinha}>
            <TouchableOpacity
              onPress={() => falar(passo.instrucao)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ouvir a instrução de novo"
              style={[
                styles.botaoControle,
                { borderColor: tema.borda, backgroundColor: tema.cartao },
              ]}
            >
              <Volume2 size={20} color={tema.roxoEscuro} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={recomecar}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Recomeçar simulação"
              style={[
                styles.botaoControle,
                { borderColor: tema.borda, backgroundColor: tema.cartao },
              ]}
            >
              <RefreshCw size={20} color={tema.roxoEscuro} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  containerPreencher: {
    flex: 1,
  },
  areaCelular: {
    flex: 1,
  },
  areaTelefone: {
    flex: 1,
  },
  rodape: {
    // Sobe um pouco para a Mimi encostar na borda inferior do celular.
    marginTop: -18,
  },
  areaMimi: {
    // Mantém a altura estável para o celular não pular no feedback.
    minHeight: 104,
  },
  rolagem: {
    flex: 1,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  controleLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  botaoControle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTextos: {
    flex: 1,
    gap: 2,
  },
  textoFeedback: {
    fontFamily: "Poppins_600SemiBold",
  },
  dica: {
    fontFamily: "Poppins_300Light",
  },
});
