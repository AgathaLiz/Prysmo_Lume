import { Volume2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const MIMI_FRENTE = require("../assets/Lume/Mimi/Png/mimi-de-frente.png");

export type RetanguloAlvo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PassoGuiaMimi = {
  id: string;
  texto: string;
  /** Rótulo do botão principal (padrão: "Próximo" ou "Entendi" no último). */
  rotuloBotao?: string;
};

type Props = {
  visivel: boolean;
  /** Retângulo do elemento em destaque (na janela). Se omitido, mostra só o cartão centralizado. */
  alvo?: RetanguloAlvo | null;
  texto: string;
  passoAtual?: number;
  totalPassos?: number;
  textoBotaoPrincipal?: string;
  textoBotaoSecundario?: string;
  /** Reserva espaço no rodapé para a barra de navegação flutuante. */
  comBarraInferior?: boolean;
  aoPressionarPrincipal: () => void;
  aoPressionarSecundario?: () => void;
};

/**
 * Guia interativo da Mimi para o primeiro acesso:
 * - Escurece o fundo ao redor do componente em destaque (deixando o componente
 *   em destaque clicável/preenchível!).
 * - Exibe o cartão branco com brilho roxo suave e a Mimi saindo por cima,
 *   seguindo o mockup enviado, com letras grandes e botão de áudio-descrição.
 */
export function GuiaMimi({
  visivel,
  alvo,
  texto,
  passoAtual,
  totalPassos,
  textoBotaoPrincipal = "Próximo",
  textoBotaoSecundario = "Pular tutorial",
  comBarraInferior = false,
  aoPressionarPrincipal,
  aoPressionarSecundario,
}: Props) {
  const { width: larguraTela, height: alturaTela } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { fonte, falar, audioDescricao } = useAcessibilidade();
  const [alturaCartao, setAlturaCartao] = useState(210);

  // Quando a áudio-descrição está ligada, a Mimi lê automaticamente cada passo.
  useEffect(() => {
    if (visivel && audioDescricao && texto.trim().length > 0) {
      falar(texto);
    }
  }, [visivel, audioDescricao, texto, falar]);

  if (!visivel) return null;

  const temAlvo =
    alvo && alvo.width > 0 && alvo.height > 0 && alvo.y < alturaTela;

  const folga = 6;
  const rx = temAlvo ? Math.max(0, alvo.x - folga) : 0;
  const ry = temAlvo ? Math.max(0, alvo.y - folga) : 0;
  const rw = temAlvo ? Math.min(larguraTela - rx, alvo.width + folga * 2) : 0;
  const rh = temAlvo ? Math.min(alturaTela - ry, alvo.height + folga * 2) : 0;

  // Posiciona o cartão da Mimi abaixo do item em destaque, ou acima dele se
  // não couber embaixo (respeitando a área da Mimi que sai 86px acima do cartão
  // e a barra de navegação flutuante quando existir).
  const folgaInferior = insets.bottom + (comBarraInferior ? 120 : 18);
  const espacoAbaixo = temAlvo ? alturaTela - (ry + rh) - folgaInferior : 0;
  const espacoAcima = temAlvo ? ry - insets.top : 0;
  const topoMaximo = Math.max(
    insets.top + 86,
    alturaTela - alturaCartao - folgaInferior
  );

  let topoCartao: number;
  if (!temAlvo) {
    topoCartao = Math.min(
      topoMaximo,
      Math.max(insets.top + 86, (alturaTela - folgaInferior - alturaCartao) / 2)
    );
  } else if (espacoAbaixo >= alturaCartao + 96) {
    // Reserva 96px entre o alvo e o cartão para a cabeça da Mimi (top: -86) não cobrir o campo.
    topoCartao = Math.min(topoMaximo, ry + rh + 96);
  } else if (espacoAcima >= alturaCartao + 104) {
    topoCartao = ry - alturaCartao - 18;
  } else {
    topoCartao = topoMaximo;
  }

  return (
    <View style={styles.camada} pointerEvents="box-none">
      {/* Máscara escura em 4 partes ao redor do alvo, deixando o alvo livre para toque */}
      {temAlvo ? (
        <>
          <View
            style={[styles.sombra, { top: 0, left: 0, right: 0, height: ry }]}
            pointerEvents="auto"
          />
          <View
            style={[
              styles.sombra,
              { top: ry + rh, left: 0, right: 0, bottom: 0 },
            ]}
            pointerEvents="auto"
          />
          <View
            style={[
              styles.sombra,
              { top: ry, left: 0, width: rx, height: rh },
            ]}
            pointerEvents="auto"
          />
          <View
            style={[
              styles.sombra,
              { top: ry, left: rx + rw, right: 0, height: rh },
            ]}
            pointerEvents="auto"
          />

          <View
            pointerEvents="none"
            style={[
              styles.destaqueBorda,
              {
                top: ry,
                left: rx,
                width: rw,
                height: rh,
              },
            ]}
          />
        </>
      ) : (
        <View style={[styles.sombra, StyleSheet.absoluteFill]} pointerEvents="auto" />
      )}

      {/* Cartão da Mimi baseado na imagem enviada */}
      <View
        style={[styles.envoltorioCartao, { top: topoCartao }]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (Math.abs(h - alturaCartao) > 4) setAlturaCartao(h);
        }}
        accessibilityViewIsModal
      >
        <Image
          source={MIMI_FRENTE}
          style={styles.mimi}
          resizeMode="contain"
          accessible={false}
          importantForAccessibility="no"
        />

        <View style={styles.cartao}>
          <View style={styles.topoCartao}>
            {passoAtual && totalPassos ? (
              <Text style={[styles.contador, { fontSize: fonte(13) }]}>
                Passo {passoAtual} de {totalPassos}
              </Text>
            ) : (
              <Text style={[styles.contador, { fontSize: fonte(13) }]}>
                Mimi te ajuda
              </Text>
            )}

            <Pressable
              onPress={() => falar(texto)}
              style={({ pressed }) => [
                styles.botaoOuvir,
                pressed && styles.pressionado,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ouvir explicação em voz alta"
            >
              <Volume2 size={20} color="#6D1E96" strokeWidth={2.5} />
              <Text style={[styles.textoOuvir, { fontSize: fonte(14) }]}>
                Ouvir
              </Text>
            </Pressable>
          </View>

          <View style={styles.divisor} />

          <Text style={[styles.textoFala, { fontSize: fonte(18) }]}>
            {texto}
          </Text>

          <View style={styles.linhaBotoes}>
            {aoPressionarSecundario ? (
              <Pressable
                onPress={aoPressionarSecundario}
                style={({ pressed }) => [
                  styles.pilulaSecundaria,
                  pressed && styles.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel={textoBotaoSecundario}
              >
                <Text
                  style={[styles.textoPilulaSecundaria, { fontSize: fonte(15) }]}
                  numberOfLines={1}
                >
                  {textoBotaoSecundario}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={aoPressionarPrincipal}
              style={({ pressed }) => [
                styles.pilulaPrincipal,
                pressed && styles.pressionado,
              ]}
              accessibilityRole="button"
              accessibilityLabel={textoBotaoPrincipal}
            >
              <Text
                style={[styles.textoPilulaPrincipal, { fontSize: fonte(16) }]}
                numberOfLines={1}
              >
                {textoBotaoPrincipal}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Mede um componente na tela de forma segura para usar como `alvo` no `GuiaMimi`. */
export function medirAlvo(
  ref: React.RefObject<View | null>,
  aoMedir: (retangulo: RetanguloAlvo) => void
) {
  if (!ref.current || typeof ref.current.measureInWindow !== "function") return;
  ref.current.measureInWindow((x, y, width, height) => {
    if (width > 0 && height > 0) {
      aoMedir({ x, y, width, height });
    }
  });
}

/**
 * Mede automaticamente o elemento correspondente ao passo atual do guia
 * sempre que o passo ou a visibilidade mudar.
 */
export function useAlvoGuia(
  ativo: boolean,
  indice: number,
  refs: (React.RefObject<View | null> | null)[]
) {
  const [alvo, setAlvo] = useState<RetanguloAlvo | null>(null);

  const remedir = useCallback(() => {
    if (!ativo) {
      setAlvo(null);
      return;
    }
    const ref = refs[indice];
    if (!ref) {
      setAlvo(null);
      return;
    }
    medirAlvo(ref, setAlvo);
  }, [ativo, indice, refs]);

  useEffect(() => {
    if (!ativo) {
      setAlvo(null);
      return;
    }
    const timer = setTimeout(remedir, 140);
    return () => clearTimeout(timer);
  }, [ativo, indice, remedir]);

  return { alvo, remedir };
}

const styles = StyleSheet.create({
  camada: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  sombra: {
    position: "absolute",
    backgroundColor: "rgba(18, 8, 28, 0.72)",
  },
  destaqueBorda: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#FFD651",
    shadowColor: "#FFD651",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  envoltorioCartao: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  mimi: {
    position: "absolute",
    top: -86,
    right: 16,
    width: 112,
    height: 112,
    zIndex: 2,
  },
  cartao: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#E9B8FF",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: "#C77DFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 12,
  },
  topoCartao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 96,
    minHeight: 36,
    gap: 8,
  },
  contador: {
    fontFamily: "Poppins_600SemiBold",
    color: "#8E8494",
  },
  botaoOuvir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3E5FC",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoOuvir: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#6D1E96",
  },
  divisor: {
    height: 1,
    backgroundColor: "#6B5E73",
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.45,
  },
  textoFala: {
    fontFamily: "Poppins_600SemiBold",
    color: "#303030",
    lineHeight: 26,
    marginBottom: 14,
  },
  linhaBotoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 10,
  },
  pilulaPrincipal: {
    backgroundColor: "#D17EFF",
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 22,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  textoPilulaPrincipal: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#2C1038",
  },
  pilulaSecundaria: {
    backgroundColor: "#F5F2F7",
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4DCE9",
  },
  textoPilulaSecundaria: {
    fontFamily: "Poppins_600SemiBold",
    color: "#4A3F52",
  },
  pressionado: {
    opacity: 0.85,
  },
});
