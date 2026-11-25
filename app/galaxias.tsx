import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Lock, Sparkles } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraNavegacao } from "@/components/BarraNavegacao";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { obterUsuarioId } from "@/lib/progresso";
import { supabase } from "@/lib/supabase";
import {
  montarTrilha,
  trilhaExemplo,
  type NivelBanco,
  type NivelTrilha,
  type ProgressoBanco,
} from "@/lib/trilha";

const MIMI_SORRINDO = require("../assets/Lume/Mimi/Png/mimi-sorrindo.png");

export default function GalaxiasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, modoEscuro, fonte } = useAcessibilidade();

  const [galaxias, setGalaxias] = useState<NivelTrilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const montado = useRef(true);

  const carregar = useCallback(async (refresh = false) => {
    if (refresh) setAtualizando(true);
    try {
      setErro("");
      const usuarioId = await obterUsuarioId();
      if (!usuarioId) {
        if (montado.current) {
          setGalaxias(trilhaExemplo());
          setCarregando(false);
          setAtualizando(false);
        }
        return;
      }

      const [respostaNiveis, respostaProgresso] = await Promise.all([
        supabase
          .from("niveis")
          .select(
            "niveis_id, nome, aulas(aulas_id, niveis_id, nome, ordem, licoes(licoes_id, aulas_id))"
          )
          .order("niveis_id", { ascending: true }),
        supabase
          .from("progresso_licao")
          .select("licoes_id, concluida, pontuacao")
          .eq("usuario_id", usuarioId),
      ]);

      if (respostaNiveis.error || respostaProgresso.error) {
        if (montado.current) {
          setErro("Não conseguimos carregar as galáxias. Verifique a internet.");
        }
        return;
      }

      const trilhaBanco = montarTrilha(
        (respostaNiveis.data ?? []) as unknown as NivelBanco[],
        (respostaProgresso.data ?? []) as ProgressoBanco[]
      );
      const semLicoes = trilhaBanco.every((nivel) => nivel.total === 0);

      if (montado.current) {
        setGalaxias(semLicoes ? trilhaExemplo() : trilhaBanco);
      }
    } catch {
      if (montado.current) {
        setErro("Parece que a internet falhou. Vamos tentar de novo?");
      }
    } finally {
      if (montado.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      montado.current = true;
      void carregar(false);
      return () => {
        montado.current = false;
      };
    }, [carregar])
  );

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/pages/tela_inicial" as any);
  }

  function abrirGalaxia(indice: number) {
    router.push({
      pathname: "/trilha",
      params: { nivel: String(indice) },
    });
  }

  const fundo = modoEscuro ? tema.fundo : "#FFFFFF";

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <View style={styles.topo}>
        <TouchableOpacity
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={[
            styles.botaoVoltar,
            {
              backgroundColor: modoEscuro ? tema.cartao : "#F6F2F8",
              borderColor: tema.borda,
            },
          ]}
        >
          <ArrowLeft size={24} color={tema.texto} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.topoTextos}>
          <Text style={[styles.tituloTela, { color: tema.texto, fontSize: fonte(28) }]}>
            Galáxias
          </Text>
          <Text
            style={[
              styles.subtituloTela,
              { color: tema.textoSecundario, fontSize: fonte(16) },
            ]}
          >
            Escolha uma galáxia para explorar
          </Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.roxoEscuro} />
          <Text style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(18) }]}>
            Carregando galáxias...
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(18) }]}>
            {erro}
          </Text>
          <Pressable
            style={[styles.botaoTentar, { backgroundColor: tema.roxo }]}
            onPress={() => void carregar(false)}
          >
            <Text style={[styles.textoTentar, { fontSize: fonte(17) }]}>
              Tentar de novo
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.conteudo,
            { paddingBottom: 124 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => void carregar(true)}
              colors={[tema.roxoEscuro]}
            />
          }
        >
          {/* Cabeçalho com a Mimi no estilo do app */}
          <View style={styles.bannerMimi}>
            <Image
              source={MIMI_SORRINDO}
              style={styles.mimiImagem}
              resizeMode="contain"
              accessible={false}
            />
            <View
              style={[
                styles.balaoMimi,
                {
                  backgroundColor: modoEscuro ? tema.cartao : "#FFF4CC",
                  borderColor: modoEscuro ? tema.borda : "#FFD651",
                },
              ]}
            >
              <Text
                style={[
                  styles.textoBalao,
                  { color: tema.texto, fontSize: fonte(16) },
                ]}
              >
                Cada galáxia traz lições práticas para você aprender no seu ritmo!
              </Text>
            </View>
          </View>

          {galaxias.map((galaxia, indice) => {
            const usaRoxo = indice % 2 === 0;
            const corBase = usaRoxo ? "#C965FF" : "#FFD24C";
            const corCirculo1 = usaRoxo ? "#D98AFF" : "#FFDC6E";
            const corCirculo2 = usaRoxo ? "#E6ACFF" : "#FFE694";
            const corCirculo3 = usaRoxo ? "#F0CAFF" : "#FFF0BA";
            const corTitulo = usaRoxo ? "#2C1038" : "#303030";
            const corSubtitulo = usaRoxo ? "#3E1B4D" : "#4A3A10";
            const progresso =
              galaxia.total > 0
                ? Math.round((galaxia.concluidas / galaxia.total) * 100)
                : 0;

            return (
              <Pressable
                key={galaxia.niveis_id}
                style={({ pressed }) => [
                  styles.cartaoGalaxia,
                  {
                    backgroundColor: corBase,
                    opacity: pressed ? 0.92 : 1,
                    shadowColor: usaRoxo ? "#8C3DB8" : "#A07B12",
                  },
                ]}
                onPress={() => abrirGalaxia(indice)}
                accessibilityRole="button"
                accessibilityLabel={`Galáxia ${indice + 1}: ${galaxia.nome}. ${galaxia.resumo}`}
              >
                {/* Círculos concêntricos limpos (sem borda defeituosa de PNG) */}
                <View style={styles.camadaCirculos} pointerEvents="none">
                  <View
                    style={[
                      styles.circuloExterno,
                      { backgroundColor: corCirculo1 },
                    ]}
                  />
                  <View
                    style={[
                      styles.circuloMedio,
                      { backgroundColor: corCirculo2 },
                    ]}
                  />
                  <View
                    style={[
                      styles.circuloInterno,
                      { backgroundColor: corCirculo3 },
                    ]}
                  />
                </View>

                <View style={styles.conteudoCartao}>
                  <View
                    style={[
                      styles.seloGalaxia,
                      {
                        backgroundColor: usaRoxo
                          ? "rgba(44, 16, 56, 0.12)"
                          : "rgba(48, 48, 48, 0.1)",
                      },
                    ]}
                  >
                    <Sparkles size={15} color={corTitulo} />
                    <Text
                      style={[
                        styles.textoSelo,
                        { color: corTitulo, fontSize: fonte(13) },
                      ]}
                    >
                      GALÁXIA {indice + 1}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.tituloGrande,
                      { color: corTitulo, fontSize: fonte(28) },
                    ]}
                  >
                    {galaxia.nome}
                  </Text>

                  <Text
                    style={[
                      styles.rotuloGrande,
                      { color: corSubtitulo, fontSize: fonte(16) },
                    ]}
                  >
                    {galaxia.concluidas} de {galaxia.total}{" "}
                    {galaxia.total === 1 ? "lição concluída" : "lições concluídas"}
                  </Text>

                  <View style={styles.barraFundo}>
                    <View
                      style={[
                        styles.barraPreenchida,
                        {
                          width: `${progresso}%`,
                          backgroundColor: usaRoxo ? "#6D1E96" : "#891CC0",
                        },
                      ]}
                    />
                  </View>

                  <View
                    style={[
                      styles.botaoEntrar,
                      {
                        backgroundColor: usaRoxo ? "#FFD651" : "#891CC0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoEntrar,
                        {
                          color: usaRoxo ? "#303030" : "#FFFFFF",
                          fontSize: fonte(20),
                        },
                      ]}
                    >
                      {galaxia.concluidas > 0 ? "Continuar trilha" : "Começar agora"}
                    </Text>
                    <ChevronRight
                      size={22}
                      color={usaRoxo ? "#303030" : "#FFFFFF"}
                      strokeWidth={2.8}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}

          {galaxias.length <= 1 && (
            <View
              style={[
                styles.cartaoEmBreve,
                {
                  backgroundColor: modoEscuro ? tema.cartao : "#F8F5FA",
                  borderColor: tema.borda,
                },
              ]}
            >
              <View
                style={[
                  styles.iconeEmBreve,
                  {
                    backgroundColor: modoEscuro
                      ? "rgba(217, 135, 255, 0.16)"
                      : "#EFE2FA",
                  },
                ]}
              >
                <Lock size={22} color={tema.roxoEscuro} />
              </View>
              <View style={styles.textosEmBreve}>
                <Text
                  style={[
                    styles.tituloEmBreve,
                    { color: tema.texto, fontSize: fonte(18) },
                  ]}
                >
                  Novas galáxias em breve
                </Text>
                <Text
                  style={[
                    styles.subtituloEmBreve,
                    { color: tema.textoSecundario, fontSize: fonte(15) },
                  ]}
                >
                  Estamos preparando novos conteúdos para você continuar evoluindo.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <BarraNavegacao aba="inicio" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  botaoVoltar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topoTextos: {
    flex: 1,
  },
  tituloTela: {
    fontFamily: "Poppins_900Black",
  },
  subtituloTela: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 2,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  textoStatus: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  botaoTentar: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  textoTentar: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 6,
    gap: 18,
  },
  bannerMimi: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  mimiImagem: {
    width: 82,
    height: 82,
  },
  balaoMimi: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  textoBalao: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 23,
  },
  cartaoGalaxia: {
    minHeight: 250,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  camadaCirculos: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloExterno: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  circuloMedio: {
    position: "absolute",
    width: 255,
    height: 255,
    borderRadius: 128,
  },
  circuloInterno: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  conteudoCartao: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 28,
    gap: 8,
  },
  seloGalaxia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textoSelo: {
    fontFamily: "Poppins_800ExtraBold",
    letterSpacing: 0.8,
  },
  tituloGrande: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    width: "100%",
    lineHeight: 35,
    marginTop: 2,
  },
  rotuloGrande: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    width: "100%",
  },
  barraFundo: {
    width: "100%",
    maxWidth: 260,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    overflow: "hidden",
    marginTop: 4,
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 999,
  },
  botaoEntrar: {
    marginTop: 14,
    width: "100%",
    minHeight: 60,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textoEntrar: {
    fontFamily: "Poppins_800ExtraBold",
  },
  cartaoEmBreve: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconeEmBreve: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textosEmBreve: {
    flex: 1,
    gap: 2,
  },
  tituloEmBreve: {
    fontFamily: "Poppins_800ExtraBold",
  },
  subtituloEmBreve: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 21,
  },
});
