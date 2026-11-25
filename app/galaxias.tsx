import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
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
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { BarraNavegacao } from "@/components/BarraNavegacao";
import { GuiaMimi, useAlvoGuia } from "@/components/GuiaMimi";
import { TrilhaCores } from "@/constants/cores";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "@/lib/primeiro-acesso";
import { obterUsuarioId } from "@/lib/progresso";
import { supabase } from "@/lib/supabase";
import {
  montarTrilha,
  trilhaExemplo,
  type NivelBanco,
  type NivelTrilha,
  type ProgressoBanco,
} from "@/lib/trilha";

const GALAXIA_IMG = require("../assets/Lume/Outros elementos/Png/galaxia.png");
const MIMI_PRA_BAIXO = require("../assets/Lume/Mimi/Png/mimi-pra-baixo.png");

const ESTRELAS_FUNDO = [
  { x: 0.09, y: 0.06, r: 1.5, o: 0.6 },
  { x: 0.28, y: 0.11, r: 1.0, o: 0.45 },
  { x: 0.72, y: 0.05, r: 1.7, o: 0.55 },
  { x: 0.91, y: 0.16, r: 1.2, o: 0.45 },
  { x: 0.12, y: 0.36, r: 1.4, o: 0.4 },
  { x: 0.88, y: 0.42, r: 1.6, o: 0.5 },
  { x: 0.08, y: 0.65, r: 1.6, o: 0.45 },
  { x: 0.84, y: 0.72, r: 1.2, o: 0.4 },
  { x: 0.21, y: 0.86, r: 1.4, o: 0.4 },
];

const BRILHOS_QUATRO_PONTAS = [
  { x: 0.61, y: 0.1, s: 8, o: 0.65 },
  { x: 0.16, y: 0.58, s: 6, o: 0.45 },
  { x: 0.86, y: 0.62, s: 6, o: 0.45 },
];

function estrelaQuatroPontas(cx: number, cy: number, s: number): string {
  const i = s * 0.24;
  return `M ${cx} ${cy - s} Q ${cx + i} ${cy - i} ${cx + s} ${cy} Q ${cx + i} ${cy + i} ${cx} ${cy + s} Q ${cx - i} ${cy + i} ${cx - s} ${cy} Q ${cx - i} ${cy - i} ${cx} ${cy - s} Z`;
}

export default function GalaxiasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: largura, height: altura } = useWindowDimensions();
  const { modoEscuro, fonte } = useAcessibilidade();

  const [galaxias, setGalaxias] = useState<NivelTrilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [guiaPrimeiroAcesso, setGuiaPrimeiroAcesso] = useState(false);
  const montado = useRef(true);

  const refPrimeiraGalaxia = useRef<View>(null);
  const refsGuia = React.useMemo(() => [refPrimeiraGalaxia], []);
  const { alvo: alvoGuia, remedir: remedirGuia } = useAlvoGuia(
    guiaPrimeiroAcesso && !carregando,
    0,
    refsGuia
  );

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
      deveMostrarGuiaTela("galaxias").then((mostrar) => {
        if (montado.current && mostrar) setGuiaPrimeiroAcesso(true);
      });
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
    if (guiaPrimeiroAcesso) {
      setGuiaPrimeiroAcesso(false);
    }
    router.push({
      pathname: "/trilha",
      params: { nivel: String(indice) },
    });
  }

  const coresGradiente = modoEscuro
    ? ([
        TrilhaCores.gradienteTopoEscuro,
        TrilhaCores.gradienteMeioEscuro,
        TrilhaCores.gradienteFundoEscuro,
      ] as const)
    : ([
        TrilhaCores.gradienteTopo,
        TrilhaCores.gradienteMeio,
        TrilhaCores.gradienteFundo,
      ] as const);

  return (
    <SafeAreaView
      style={[
        styles.tela,
        {
          backgroundColor: modoEscuro
            ? TrilhaCores.gradienteFundoEscuro
            : TrilhaCores.gradienteFundo,
        },
      ]}
      edges={["top"]}
    >
      {/* Fundo cósmico */}
      <LinearGradient
        colors={coresGradiente}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Svg
        width={largura}
        height={altura}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="nebulaRoxaG" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#9B37E1" stopOpacity={0.3} />
            <Stop offset="100%" stopColor="#9B37E1" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nebulaQuenteG" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E08B5A" stopOpacity={0.22} />
            <Stop offset="100%" stopColor="#E08B5A" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle
          cx={largura * 0.15}
          cy={altura * 0.42}
          r={largura * 0.55}
          fill="url(#nebulaRoxaG)"
        />
        <Circle
          cx={largura * 0.88}
          cy={altura * 0.65}
          r={largura * 0.55}
          fill="url(#nebulaQuenteG)"
        />

        {ESTRELAS_FUNDO.map((estrela, indice) => (
          <Circle
            key={`dot-${indice}`}
            cx={largura * estrela.x}
            cy={altura * estrela.y}
            r={estrela.r}
            fill="#FFFFFF"
            opacity={estrela.o}
          />
        ))}

        {BRILHOS_QUATRO_PONTAS.map((b, indice) => (
          <Path
            key={`spark-${indice}`}
            d={estrelaQuatroPontas(largura * b.x, altura * b.y, b.s)}
            fill="#FFE169"
            opacity={b.o}
          />
        ))}
      </Svg>

      {/* Topo: "< Voltar" */}
      <View style={styles.topo}>
        <TouchableOpacity
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.botaoVoltar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 16 }}
        >
          <ChevronLeft size={26} color={TrilhaCores.estrela} strokeWidth={2.8} />
          <Text style={[styles.textoVoltar, { fontSize: fonte(22) }]}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={TrilhaCores.estrela} />
          <Text style={[styles.textoStatus, { fontSize: fonte(19) }]}>
            Carregando galáxias...
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={[styles.textoStatus, { fontSize: fonte(19) }]}>
            {erro}
          </Text>
          <Pressable
            style={styles.botaoTentar}
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
          onScroll={remedirGuia}
          scrollEventThrottle={32}
          onScrollEndDrag={remedirGuia}
          onMomentumScrollEnd={remedirGuia}
          contentContainerStyle={[
            styles.conteudo,
            { paddingBottom: 124 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => void carregar(true)}
              colors={[TrilhaCores.estrela]}
              tintColor="#FFFFFF"
              progressBackgroundColor={TrilhaCores.gradienteMeio}
            />
          }
        >
          {/* Cartão de boas-vindas GALÁXIAS + Mimi no canto superior direito */}
          <View style={styles.envoltorioIntro}>
            <Image
              source={MIMI_PRA_BAIXO}
              style={styles.mimiTopo}
              resizeMode="contain"
              accessible={false}
            />
            <View style={styles.cartaoIntro}>
              <Text style={[styles.tituloIntro, { fontSize: fonte(32) }]}>
                GALÁXIAS
              </Text>
              <Text style={[styles.textoIntro, { fontSize: fonte(19) }]}>
                Aqui no Lume as trilhas se chamam galáxias e cada uma traz lições
                práticas para você aprender no seu ritmo!
              </Text>
            </View>
          </View>

          {/* Galáxias disponíveis */}
          {galaxias.map((galaxia, indice) => {
            const progresso =
              galaxia.total > 0
                ? Math.round((galaxia.concluidas / galaxia.total) * 100)
                : 0;

            return (
              <View
                key={galaxia.niveis_id}
                ref={indice === 0 ? refPrimeiraGalaxia : undefined}
                collapsable={false}
                onLayout={() => {
                  if (indice === 0 && guiaPrimeiroAcesso) {
                    setTimeout(remedirGuia, 100);
                  }
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.blocoGalaxia,
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                  onPress={() => abrirGalaxia(indice)}
                  accessibilityRole="button"
                  accessibilityLabel={`Galáxia ${indice + 1}: ${galaxia.nome}. ${galaxia.concluidas} de ${galaxia.total} lições concluídas.`}
                >
                <Image
                  source={GALAXIA_IMG}
                  style={styles.imagemGalaxia}
                  resizeMode="contain"
                />

                <View style={styles.cartaoInfoGalaxia}>
                  <Text style={[styles.nomeGalaxia, { fontSize: fonte(21) }]}>
                    {galaxia.nome}
                  </Text>

                  <Text style={[styles.progressoTexto, { fontSize: fonte(15) }]}>
                    {galaxia.concluidas} de {galaxia.total}{" "}
                    {galaxia.total === 1
                      ? "Lição concluída"
                      : "Lições concluídas"}
                  </Text>

                  <View style={styles.barraTrack}>
                    <View
                      style={[
                        styles.barraFill,
                        { width: `${Math.max(progresso, 8)}%` },
                      ]}
                    />
                  </View>
                </View>
                </Pressable>
              </View>
            );
          })}

          {/* Mais em breve */}
          {galaxias.length <= 1 && (
            <View style={styles.cartaoEmBreve}>
              <View style={styles.caixaCadeado}>
                <Lock size={34} color="#FFD651" strokeWidth={2.4} />
              </View>
              <View style={styles.textosEmBreve}>
                <Text style={[styles.tituloEmBreve, { fontSize: fonte(23) }]}>
                  Mais em breve...
                </Text>
                <Text style={[styles.subtituloEmBreve, { fontSize: fonte(16) }]}>
                  Outras galáxias e lições aparecerão logo.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <BarraNavegacao aba="inicio" />

      <GuiaMimi
        visivel={guiaPrimeiroAcesso && !carregando && galaxias.length > 0}
        comBarraInferior
        alvo={alvoGuia}
        texto="Toque aqui na galáxia para abrir a sua trilha e começar suas lições!"
        textoBotaoPrincipal="Entendi"
        textoBotaoSecundario="Pular tutorial"
        aoPressionarPrincipal={() => setGuiaPrimeiroAcesso(false)}
        aoPressionarSecundario={() => {
          setGuiaPrimeiroAcesso(false);
          void concluirFluxoEssencial();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    overflow: "hidden",
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
  },
  textoVoltar: {
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.estrela,
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
    color: TrilhaCores.texto,
  },
  botaoTentar: {
    backgroundColor: TrilhaCores.estrela,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  textoTentar: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 22,
  },
  envoltorioIntro: {
    position: "relative",
    marginTop: 58,
  },
  mimiTopo: {
    position: "absolute",
    top: -54,
    right: 6,
    width: 92,
    height: 92,
    zIndex: 2,
  },
  cartaoIntro: {
    borderRadius: 20,
    backgroundColor: "rgba(42, 13, 78, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(180, 130, 255, 0.35)",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    gap: 10,
  },
  tituloIntro: {
    fontFamily: "Poppins_900Black",
    color: TrilhaCores.estrela,
    textAlign: "center",
    letterSpacing: 0.8,
  },
  textoIntro: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFE169",
    textAlign: "center",
    lineHeight: 28,
  },
  blocoGalaxia: {
    alignItems: "center",
    gap: 12,
  },
  imagemGalaxia: {
    width: "100%",
    height: 210,
  },
  cartaoInfoGalaxia: {
    width: "76%",
    minWidth: 230,
    maxWidth: 320,
    borderRadius: 18,
    backgroundColor: "rgba(42, 13, 78, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(180, 130, 255, 0.35)",
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 8,
  },
  nomeGalaxia: {
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.estrela,
    textAlign: "center",
    lineHeight: 26,
  },
  progressoTexto: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  barraTrack: {
    width: "100%",
    height: 11,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginTop: 2,
  },
  barraFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#A12AE8",
  },
  cartaoEmBreve: {
    borderRadius: 20,
    backgroundColor: "rgba(48, 44, 54, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  caixaCadeado: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: "rgba(92, 86, 72, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  textosEmBreve: {
    flex: 1,
    gap: 3,
  },
  tituloEmBreve: {
    fontFamily: "Poppins_900Black",
    color: TrilhaCores.estrela,
  },
  subtituloEmBreve: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFE169",
    lineHeight: 22,
  },
});
