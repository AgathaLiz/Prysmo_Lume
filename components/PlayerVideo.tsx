import { VideoView, useVideoPlayer } from "expo-video";
import { AlertCircle, RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BotaoGrande } from "@/components/BotaoGrande";
import { MolduraCelular } from "@/components/MolduraCelular";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  url: string;
};

/**
 * Player do expo-video dentro da moldura de celular do design.
 * O celular ocupa a tela e "ver de novo" vira um botão flutuante, para
 * não roubar altura do vídeo.
 */
export function PlayerVideo({ url }: Props) {
  const { tema, fonte, falar } = useAcessibilidade();
  const [erro, setErro] = useState(false);

  const player = useVideoPlayer(url, (playerCriado) => {
    playerCriado.loop = false;
  });

  useEffect(() => {
    const inscricao = player.addListener("statusChange", (evento) => {
      if (evento.status === "error") setErro(true);
    });
    return () => inscricao.remove();
  }, [player]);

  function verDeNovo() {
    setErro(false);
    player.currentTime = 0;
    player.play();
  }

  if (erro) {
    return (
      <MolduraCelular preencher>
        <View style={[styles.fallback, { backgroundColor: tema.cartaoSuave }]}>
          <AlertCircle size={40} color={tema.textoSecundario} />
          <Text style={[styles.tituloErro, { color: tema.texto, fontSize: fonte(19) }]}>
            Não conseguimos carregar o vídeo
          </Text>
          <Text style={[styles.textoErro, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
            Tudo bem. Você pode continuar sem ele.
          </Text>
          <BotaoGrande
            titulo="Tentar de novo"
            variante="contorno"
            icone={<RotateCcw size={22} color={tema.roxoEscuro} />}
            onPress={() => {
              setErro(false);
              player.play();
            }}
          />
        </View>
      </MolduraCelular>
    );
  }

  return (
    <MolduraCelular preencher>
      <View style={styles.areaVideo}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls
          allowsFullscreen
        />

        <TouchableOpacity
          onPress={() => {
            falar("Vamos ver o vídeo de novo.");
            verDeNovo();
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Ver o vídeo de novo"
          style={styles.verDeNovo}
        >
          <RotateCcw size={20} color="#303030" />
        </TouchableOpacity>
      </View>
    </MolduraCelular>
  );
}

const styles = StyleSheet.create({
  areaVideo: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    flex: 1,
  },
  verDeNovo: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  fallback: {
    flex: 1,
    padding: 20,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tituloErro: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  textoErro: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginBottom: 6,
  },
});
