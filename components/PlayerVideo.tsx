import { VideoView, useVideoPlayer } from "expo-video";
import { AlertCircle, RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

type Props = {
  url: string;
};

/**
 * Player do expo-video com controles nativos (grandes) e um botão
 * "Ver de novo" bem visível. Se o vídeo não carregar, avisa sem drama.
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
      <View
        style={[
          styles.fallback,
          { backgroundColor: tema.cartaoSuave, borderColor: tema.borda },
        ]}
      >
        <AlertCircle size={40} color={tema.textoSecundario} />
        <Text style={[styles.tituloErro, { color: tema.texto, fontSize: fonte(20) }]}>
          Não conseguimos carregar o vídeo
        </Text>
        <Text style={[styles.textoErro, { color: tema.textoSecundario, fontSize: fonte(18) }]}>
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
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.molduraVideo, { backgroundColor: "#000000" }]}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls
          allowsFullscreen
        />
      </View>

      <BotaoGrande
        titulo="Ver de novo"
        variante="contorno"
        icone={<RotateCcw size={22} color={tema.roxoEscuro} />}
        onPress={() => {
          falar("Vamos ver o vídeo de novo.");
          verDeNovo();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  molduraVideo: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
  fallback: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    alignItems: "center",
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
