import {
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BotaoGrande } from "@/components/BotaoGrande";
import { BotaoOuvir } from "@/components/BotaoOuvir";
import { TelasFicticias } from "@/components/simulador/TelasFicticias";
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
};

type Feedback = { tipo: "acerto" | "erro"; texto: string } | null;

/**
 * Celular de mentirinha.
 *
 * O passo atual fica escrito em cima (grande) e o elemento certo recebe
 * uma borda/brilho. Errar não pune: mostra a dica e deixa tentar de novo.
 */
export function SimuladorCelular({ cenario, onFinalizar }: Props) {
  const { tema, fonte, audioDescricao, falar, pararFala } = useAcessibilidade();

  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [travado, setTravado] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passo = cenario.passos[indice];
  const total = cenario.passos.length;

  // Limpa o timer ao sair da tela.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Lê a instrução nova sozinho quando a audio-descrição está ligada.
  useEffect(() => {
    if (!audioDescricao || !passo) return;
    falar(passo.instrucao);
  }, [audioDescricao, passo, falar]);

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
    <View style={styles.container}>
      {/* Instrução grande, sempre visível */}
      <View
        style={[
          styles.cartaoInstrucao,
          { backgroundColor: tema.cartao, borderColor: tema.borda },
        ]}
      >
        <Text
          style={[styles.passoAtual, { color: tema.textoSecundario, fontSize: fonte(15) }]}
        >
          Passo {indice + 1} de {total}
        </Text>
        <Text
          style={[styles.instrucao, { color: tema.texto, fontSize: fonte(22) }]}
          accessibilityLiveRegion="polite"
        >
          {passo.instrucao}
        </Text>

        <BotaoOuvir
          texto={`${passo.instrucao}. ${passo.dica ?? ""}`.trim()}
          estilo={styles.ouvir}
        />
      </View>

      {/* Moldura do celular */}
      <View style={styles.moldura}>
        <View style={styles.telaFalsa}>
          <ScrollView
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
        </View>
      </View>

      {/* Feedback */}
      {feedback && (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor:
                feedback.tipo === "acerto" ? tema.sucessoFundo : tema.erroFundo,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          {feedback.tipo === "acerto" ? (
            <CheckCircle2 size={26} color={tema.sucesso} />
          ) : (
            <XCircle size={26} color={tema.erro} />
          )}
          <Text
            style={[
              styles.textoFeedback,
              {
                color: feedback.tipo === "acerto" ? tema.sucesso : tema.erro,
                fontSize: fonte(18),
              },
            ]}
          >
            {feedback.texto}
          </Text>
        </View>
      )}

      {feedback?.tipo === "erro" && (
        <View style={styles.dicaLinha}>
          <Lightbulb size={20} color={tema.textoSecundario} />
          <Text style={[styles.textoDica, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
            Você pode tocar de novo. Não tem pressa.
          </Text>
        </View>
      )}

      <BotaoGrande
        titulo="Recomeçar simulação"
        variante="contorno"
        icone={<RefreshCw size={22} color={tema.roxoEscuro} />}
        onPress={recomecar}
        estilo={styles.recomecar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  cartaoInstrucao: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  passoAtual: {
    fontFamily: "Poppins_600SemiBold",
  },
  instrucao: {
    fontFamily: "Poppins_800ExtraBold",
  },
  ouvir: {
    alignSelf: "flex-start",
  },
  moldura: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    height: 430,
    backgroundColor: "#1A1A1A",
    borderRadius: 34,
    padding: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  telaFalsa: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    overflow: "hidden",
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 14,
  },
  textoFeedback: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  dicaLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  textoDica: {
    flex: 1,
    fontFamily: "Poppins_300Light",
  },
  recomecar: {
    marginTop: 4,
  },
});
