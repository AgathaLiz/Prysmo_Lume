import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  AlertCircle,
  Pause,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { BarraStatus } from "@/components/BarraStatus";
import { BotaoGrande } from "@/components/BotaoGrande";
import { MolduraCelular } from "@/components/MolduraCelular";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  titulo: string;
  /** Sem URL, mostramos o desenho do player (controles e barra). */
  url: string | null;
  onFechar: () => void;
  onContinuar: () => void;
};

/**
 * Tela de vídeo da lição, seguindo a arte da Mimi.
 *
 * O celular ocupa quase toda a tela, o X vermelho fica sobre o canto
 * dele e, embaixo, ficam o botão amarelo de "ver de novo" e o botão
 * roxo "Continuar". Quando a lição ainda não tem vídeo, o aparelho
 * mostra os controles e a barra de progresso do mockup.
 */
export function VideoLicao({ titulo, url, onFechar, onContinuar }: Props) {
  const { tema, fonte, falar } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();
  const [erro, setErro] = useState(false);

  const player = useVideoPlayer(url ?? null, (playerCriado) => {
    playerCriado.loop = false;
  });

  useEffect(() => {
    if (!url) return;
    const inscricao = player.addListener("statusChange", (evento) => {
      if (evento.status === "error") setErro(true);
    });
    return () => inscricao.remove();
  }, [player, url]);

  function verDeNovo() {
    falar("Vamos ver o vídeo de novo.");
    if (!url) return;
    setErro(false);
    player.currentTime = 0;
    player.play();
  }

  const margem = Math.round(larguraTela * 0.05);
  const ladoX = Math.min(64, Math.round(larguraTela * 0.16));
  /**
   * Altura do "Continuar": a mesma do quiz. O botão redondo de "ver de novo"
   * fica na mesma linha e acompanha essa altura, como no mockup.
   */
  const alturaBotao = Math.min(84, Math.round(larguraTela * 0.2));
  const espacoBotoes = Math.round(larguraTela * 0.03);
  const espacoConteudo = Math.round(larguraTela * 0.035);
  const temVideo = Boolean(url) && !erro;

  return (
    <View style={styles.tela}>
      <BarraStatus />

      <View
        style={[
          styles.conteudo,
          { paddingHorizontal: margem, gap: espacoConteudo },
        ]}
      >
        <View style={styles.palco}>
          <MolduraCelular preencher semBarraStatus>
            {temVideo ? (
              <View style={styles.areaVideo}>
                <VideoView
                  player={player}
                  style={styles.video}
                  contentFit="contain"
                  nativeControls
                  allowsFullscreen
                />
              </View>
            ) : erro ? (
              <View style={[styles.fallback, { backgroundColor: tema.cartaoSuave }]}>
                <AlertCircle size={40} color={tema.textoSecundario} />
                <Text
                  style={[styles.fallbackTitulo, { color: tema.texto, fontSize: fonte(18) }]}
                >
                  Não conseguimos carregar o vídeo
                </Text>
                <Text
                  style={[
                    styles.fallbackTexto,
                    { color: tema.textoSecundario, fontSize: fonte(15) },
                  ]}
                >
                  Tudo bem. Você pode continuar sem ele.
                </Text>
              </View>
            ) : (
              <>
                <View
                  accessible
                  accessibilityLabel={`Vídeo da lição ${titulo}. O vídeo ainda não está disponível.`}
                  style={styles.areaVideoCinza}
                >
                  <View style={styles.controles}>
                    <View style={styles.controle}>
                      <RotateCcw size={34} color="#BDBDBD" />
                      <Text style={[styles.controleTexto, { fontSize: fonte(11) }]}>
                        10
                      </Text>
                    </View>

                    <Pause size={42} color="#BDBDBD" />

                    <View style={styles.controle}>
                      <RotateCw size={34} color="#BDBDBD" />
                      <Text style={[styles.controleTexto, { fontSize: fonte(11) }]}>
                        10
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressoArea} pointerEvents="none">
                  <View style={styles.progressoTrilha}>
                    <LinearGradient
                      colors={["#C77DFF", "#FFB45E"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressoPreenchido}
                    />
                    <View style={styles.progressoKnob} />
                  </View>
                </View>
              </>
            )}
          </MolduraCelular>

          <TouchableOpacity
            onPress={onFechar}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sair da lição"
            style={[
              styles.botaoFechar,
              {
                width: ladoX,
                height: ladoX,
                borderRadius: Math.round(ladoX * 0.28),
              },
            ]}
          >
            <X size={Math.round(ladoX * 0.55)} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View style={[styles.rodape, { gap: espacoBotoes }]}>
          <TouchableOpacity
            onPress={verDeNovo}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver o vídeo de novo"
            style={[
              styles.botaoIcone,
              {
                width: alturaBotao,
                height: alturaBotao,
                borderRadius: Math.round(alturaBotao * 0.32),
                backgroundColor: tema.destaque,
              },
            ]}
          >
            <RotateCcw
              size={Math.round(alturaBotao * 0.5)}
              color={tema.texto}
              strokeWidth={3}
            />
          </TouchableOpacity>

          <View style={styles.continuarArea}>
            <BotaoGrande
              titulo="Continuar"
              variante="roxo"
              onPress={onContinuar}
              estilo={{
                minHeight: alturaBotao,
                borderRadius: Math.round(alturaBotao * 0.42),
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  conteudo: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 20,
  },
  palco: {
    flex: 1,
  },
  botaoFechar: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: "#E23B2E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  areaVideo: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    flex: 1,
  },
  areaVideoCinza: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
  },
  controle: {
    alignItems: "center",
    justifyContent: "center",
  },
  controleTexto: {
    marginTop: -4,
    fontFamily: "Poppins_600SemiBold",
    color: "#BDBDBD",
  },
  progressoArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  progressoTrilha: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
  },
  progressoPreenchido: {
    width: "18%",
    height: "100%",
    borderRadius: 6,
  },
  progressoKnob: {
    position: "absolute",
    left: "18%",
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    backgroundColor: "#FFB45E",
  },
  fallback: {
    flex: 1,
    padding: 20,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackTitulo: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  fallbackTexto: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
  },
  rodape: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoIcone: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  continuarArea: {
    flex: 1,
  },
});
