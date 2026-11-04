import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Star,
  WifiOff,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { BarraNavegacao } from "@/components/BarraNavegacao";
import { BotaoGrande } from "@/components/BotaoGrande";
import { ALTURA_NO, NoTrilha, Y_CENTRO } from "@/components/NoTrilha";
import { TutorialTrilha } from "@/components/TutorialTrilha";
import { TrilhaCores } from "@/constants/cores";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { obterUsuarioId } from "@/lib/progresso";
import { supabase } from "@/lib/supabase";
import {
  licaoAtual,
  montarTrilha,
  resumoGeral,
  trilhaExemplo,
  type LicaoTrilha,
  type NivelBanco,
  type NivelTrilha,
  type ProgressoBanco,
} from "@/lib/trilha";

const CHAVE_TUTORIAL = "lume_trilha_tutorial_visto";

const CAMINHO_TRILHA = require("../assets/images/Linha.png");

// A imagem do caminho tem 263x1419 px, com curvas a cada 240 px.
// Esticamos na vertical para cada parada ficar sobre uma curva.
const LARGURA_MAXIMA_CAMINHO = 200;
const PROPORCAO_CURVA = 0.4325;
const ALTURA_IMAGEM_CAMINHO = (1419 / 240) * ALTURA_NO;

// Estrelinhas decorativas do céu (posição relativa à tela).
const ESTRELAS_FUNDO = [
  { x: 0.08, y: 0.06, r: 1.6, o: 0.55 },
  { x: 0.22, y: 0.12, r: 1, o: 0.4 },
  { x: 0.87, y: 0.08, r: 2, o: 0.5 },
  { x: 0.68, y: 0.17, r: 1.2, o: 0.35 },
  { x: 0.12, y: 0.3, r: 1.2, o: 0.35 },
  { x: 0.92, y: 0.35, r: 1.6, o: 0.45 },
  { x: 0.05, y: 0.55, r: 1.8, o: 0.4 },
  { x: 0.8, y: 0.62, r: 1.1, o: 0.3 },
  { x: 0.18, y: 0.78, r: 1.4, o: 0.35 },
  { x: 0.94, y: 0.84, r: 1.2, o: 0.3 },
];

export default function TrilhaScreen() {
  const router = useRouter();
  const { fonte, modoEscuro, recarregar } = useAcessibilidade();
  const insets = useSafeAreaInsets();
  const { width: largura, height: altura } = useWindowDimensions();

  const [secoes, setSecoes] = useState<NivelTrilha[]>([]);
  const [xp, setXp] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [exemplo, setExemplo] = useState(false);
  const [tutorialVisivel, setTutorialVisivel] = useState(false);
  const [nivelSelecionado, setNivelSelecionado] = useState<number | null>(null);
  const [larguraTrilha, setLarguraTrilha] = useState(
    Math.max(0, largura - 32)
  );

  const rolagemRef = useRef<ScrollView>(null);
  const posicoes = useRef<Record<number, number>>({});
  const offsetLista = useRef(0);
  const precisaRolar = useRef(false);
  const licaoAtualAnterior = useRef<number | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const carregar = useCallback(
    async (opcoes?: { spinner?: boolean; refresh?: boolean }) => {
      if (opcoes?.spinner) setCarregando(true);
      if (opcoes?.refresh) setAtualizando(true);

      try {
        setErro("");

        const usuarioId = await obterUsuarioId();
        if (!usuarioId) {
          if (montado.current) {
            const base = trilhaExemplo()[0];
            setSecoes([
              {
                ...base,
                licoes: Array.from({ length: 3 }, (_, indice) => ({
                  ...base.licoes[0],
                  licoes_id: -1 - indice,
                  posicao: indice + 1,
                  estado: indice === 0 ? "atual" : "bloqueada",
                })),
                total: 3,
                resumo: "São 3 lições. Vamos começar?",
              },
            ]);
            setExemplo(true);
            setCarregando(false);
          }
          return;
        }

        // Níveis, aulas e lições + progresso + XP, tudo em paralelo.
        const [respostaNiveis, respostaProgresso, respostaXp] = await Promise.all([
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
          supabase
            .from("usuario_pontuacao")
            .select("xp_total")
            .eq("usuario_id", usuarioId)
            .maybeSingle<{ xp_total: number | null }>(),
        ]);

        if (respostaNiveis.error || respostaProgresso.error) {
          console.log(
            "Erro ao carregar trilha:",
            respostaNiveis.error?.message,
            respostaProgresso.error?.message
          );
          if (montado.current) {
            setErro("Não conseguimos carregar suas lições. Verifique a internet.");
          }
          return;
        }

        const trilhaBanco = montarTrilha(
          (respostaNiveis.data ?? []) as unknown as NivelBanco[],
          (respostaProgresso.data ?? []) as ProgressoBanco[]
        );

        // Banco sem nenhuma lição ainda: mostra a primeira lição de exemplo
        // para dar para testar o fluxo completo. Quando houver conteúdo no
        // banco, esta trilha deixa de ser usada sozinha.
        const semLicoes = trilhaBanco.every((nivel) => nivel.total === 0);
        const trilha = semLicoes ? trilhaExemplo() : trilhaBanco;

        if (!montado.current) return;

        const atual = licaoAtual(trilha);
        const indiceAtual = atual
          ? trilha.findIndex((nivel) =>
              nivel.licoes.some((licao) => licao.licoes_id === atual.licoes_id)
            )
          : -1;

        setSecoes(trilha);
        setExemplo(semLicoes);
        setXp(respostaXp.data?.xp_total ?? 0);

        /**
         * Na primeira carga, abre a galáxia da lição atual.
         * Depois, só troca sozinho quando a lição atual muda de nível
         * (por exemplo, ao terminar a última lição de uma galáxia).
         */
        setNivelSelecionado((selecionado) => {
          const mudouDeLicao = atual?.licoes_id !== licaoAtualAnterior.current;
          if (selecionado === null || mudouDeLicao) {
            return indiceAtual >= 0 ? indiceAtual : selecionado ?? 0;
          }
          return Math.min(selecionado, Math.max(0, trilha.length - 1));
        });
        licaoAtualAnterior.current = atual?.licoes_id ?? null;

        precisaRolar.current = Boolean(atual);
      } catch (erroCarregar) {
        console.log("Erro inesperado na trilha:", erroCarregar);
        if (montado.current) {
          setErro("Parece que a internet falhou. Vamos tentar de novo?");
        }
      } finally {
        if (montado.current) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    },
    []
  );

  // Carrega ao entrar e de novo sempre que voltar para a tela.
  useFocusEffect(
    useCallback(() => {
      void carregar();
      void recarregar();
    }, [carregar, recarregar])
  );

  // Primeira abertura: explica como funciona.
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TUTORIAL)
      .then((visto) => {
        if (false && !visto && montado.current) setTutorialVisivel(true);
      })
      .catch(() => {
        // Se o armazenamento falhar, só não mostra o tutorial.
      });
  }, []);

  const resumo = useMemo(() => resumoGeral(secoes), [secoes]);
  const vazia = !carregando && !erro && resumo.total === 0;

  const estrelasTotais = useMemo(
    () =>
      secoes.reduce(
        (soma, nivel) =>
          soma + nivel.licoes.reduce((total, licao) => total + licao.estrelas, 0),
        0
      ),
    [secoes]
  );

  const indiceSelecionado = Math.min(
    nivelSelecionado ?? 0,
    Math.max(0, secoes.length - 1)
  );
  const secaoSelecionada = secoes[indiceSelecionado] ?? null;

  // O caminho é uma imagem; encolhemos a largura em telas pequenas para
  // as estrelas (e os nomes) não encostarem nas bordas.
  const larguraCaminho = useMemo(() => {
    if (larguraTrilha <= 0) return 0;
    const limitePeloRotulo = (larguraTrilha / 2 - 75) / PROPORCAO_CURVA;
    return Math.max(120, Math.min(LARGURA_MAXIMA_CAMINHO, limitePeloRotulo));
  }, [larguraTrilha]);

  const deslocamentoCaminho = larguraCaminho * PROPORCAO_CURVA;

  function rolarParaAtual() {
    if (!precisaRolar.current) return;
    const atual = licaoAtual(secoes);
    if (!atual) return;

    const y = posicoes.current[atual.licoes_id];
    if (y === undefined) return;

    precisaRolar.current = false;
    rolagemRef.current?.scrollTo({
      y: Math.max(0, offsetLista.current + y - 170),
      animated: true,
    });
  }

  // Rola até a lição atual quando a lista e a galáxia já estão prontas.
  useEffect(() => {
    if (secoes.length === 0) return;
    const atual = licaoAtual(secoes);
    if (!atual) return;
    if (secaoSelecionada?.licoes.some((l) => l.licoes_id === atual.licoes_id) !== true) {
      return;
    }

    const timer = setTimeout(rolarParaAtual, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secoes, indiceSelecionado]);

  // Aviso de lição bloqueada desaparece sozinho.
  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(""), 6000);
    return () => clearTimeout(timer);
  }, [aviso]);

  function fecharTutorial() {
    setTutorialVisivel(false);
    AsyncStorage.setItem(CHAVE_TUTORIAL, "1").catch(() => {});
  }

  function aoTocarLicao(licao: LicaoTrilha) {
    if (licao.estado === "bloqueada") {
      const mensagem =
        "Termine a lição anterior para abrir esta. Vamos devagar!";
      setAviso(mensagem);
      AccessibilityInfo.announceForAccessibility(mensagem);
      return;
    }

    router.push({
      pathname: "/licao/[id]",
      params: { id: String(licao.licoes_id) },
    });
  }

  function escolherNivel(indice: number) {
    setNivelSelecionado(indice);
    precisaRolar.current = false;
    rolagemRef.current?.scrollTo({ y: 0, animated: true });
  }

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/pages/tela_inicial" as any);
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

  const mensagemVazia = vazia
    ? "Ainda não há lições aqui. Volte mais tarde!"
    : secaoSelecionada && secaoSelecionada.total === 0
      ? "Esta galáxia ainda não tem lições."
      : "";

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
      {/* Fundo: céu roxo com estrelinhas e planetas suaves */}
      <LinearGradient
        colors={coresGradiente}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.planetaGrande} pointerEvents="none" />
      <View style={styles.planetaPequeno} pointerEvents="none" />
      <Svg
        width={largura}
        height={altura}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {ESTRELAS_FUNDO.map((estrela, indice) => (
          <Circle
            key={indice}
            cx={largura * estrela.x}
            cy={altura * estrela.y}
            r={estrela.r}
            fill="#FFFFFF"
            opacity={estrela.o}
          />
        ))}
      </Svg>

      {/* Topo fixo: voltar, título e ajuda sempre à mão */}
      <View style={styles.topo}>
        <TouchableOpacity
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.botaoIcone}
        >
          <ArrowLeft size={26} color={TrilhaCores.texto} />
        </TouchableOpacity>

        <Text style={[styles.tituloTela, { fontSize: fonte(24) }]}>
          Sua trilha
        </Text>

        <TouchableOpacity
          onPress={() => setTutorialVisivel(true)}
          accessibilityRole="button"
          accessibilityLabel="Ajuda: como usar a trilha"
          style={styles.botaoAjuda}
        >
          <HelpCircle size={24} color={TrilhaCores.texto} />
          <Text style={[styles.textoAjuda, { fontSize: fonte(13) }]}>
            Ajuda
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={TrilhaCores.estrela} />
          <Text style={[styles.textoStatus, { fontSize: fonte(19) }]}>
            Carregando suas lições...
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <WifiOff size={52} color={TrilhaCores.textoSecundario} />
          <Text style={[styles.textoStatus, { fontSize: fonte(19) }]}>{erro}</Text>
          <BotaoGrande
            titulo="Tentar de novo"
            onPress={() => void carregar({ spinner: true })}
            estilo={styles.botaoErro}
          />
        </View>
      ) : (
        <ScrollView
          ref={rolagemRef}
          // Sem cor de fundo aqui: o céu (gradiente, planetas e estrelas) fica
          // atrás do conteúdo e continua visível enquanto a lista rola — igual ao
          // que aparece na tela de carregamento.
          style={styles.rolagem}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={[
            styles.conteudo,
            { paddingBottom: 120 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => void carregar({ refresh: true })}
              colors={[TrilhaCores.estrela]}
              tintColor="#FFFFFF"
              progressBackgroundColor={TrilhaCores.gradienteMeio}
            />
          }
        >
          {/* XP e estrelas: o resumo fica sempre no começo */}
          <View style={styles.linhaResumo}>
            <View style={styles.chipResumo}>
              <Sparkles size={18} color={TrilhaCores.estrela} />
              <Text style={[styles.textoChip, { fontSize: fonte(16) }]}>
                {xp} XP
              </Text>
            </View>

            <View style={styles.chipResumo}>
              <Star
                size={18}
                color={TrilhaCores.estrela}
                fill={TrilhaCores.estrela}
              />
              <Text style={[styles.textoChip, { fontSize: fonte(16) }]}>
                {estrelasTotais} {estrelasTotais === 1 ? "estrela" : "estrelas"}
              </Text>
            </View>

            {resumo.total > 0 && (
              <View style={styles.chipResumo}>
                <Text style={[styles.textoChip, { fontSize: fonte(14) }]}>
                  {resumo.concluidas} de {resumo.total}
                </Text>
              </View>
            )}
          </View>

          {exemplo && (
            <View style={styles.cartaoExemplo}>
              <Sparkles size={18} color={TrilhaCores.estrela} />
              <Text style={[styles.textoExemplo, { fontSize: fonte(14) }]}>
                Conteúdo de exemplo. Quando o banco tiver lições, elas aparecem
                aqui.
              </Text>
            </View>
          )}

          {/* Galáxias: uma aba por nível */}
          {secoes.length > 0 && (
            <View style={styles.linhaAbas}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.abasConteudo}
                style={styles.abasRolagem}
              >
                {secoes.map((secao, indice) => {
                  const ativa = indice === indiceSelecionado;
                  return (
                    <TouchableOpacity
                      key={secao.niveis_id}
                      onPress={() => escolherNivel(indice)}
                      accessibilityRole="tab"
                      accessibilityLabel={`Galáxia ${indice + 1}: ${secao.nome}. ${secao.resumo}`}
                      accessibilityState={{ selected: ativa }}
                      style={[
                        styles.aba,
                        ativa ? styles.abaAtiva : styles.abaInativa,
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoAba,
                          {
                            color: ativa
                              ? TrilhaCores.textoAbaAtiva
                              : TrilhaCores.textoSecundario,
                            fontSize: fonte(15),
                          },
                        ]}
                      >
                        Galáxia {indice + 1}
                      </Text>
                      {ativa && (
                        <Star
                          size={14}
                          color={TrilhaCores.textoAbaAtiva}
                          fill={TrilhaCores.textoAbaAtiva}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {mensagemVazia !== "" && (
            <View style={styles.cartaoVazio}>
              <Star size={34} color={TrilhaCores.estrela} />
              <Text style={[styles.textoVazio, { fontSize: fonte(19) }]}>
                {mensagemVazia}
              </Text>
            </View>
          )}

          {secaoSelecionada && secaoSelecionada.total > 0 && (
            <>
              <View style={styles.cabecalhoNivel}>
                <Text style={[styles.rotuloGalaxia, { fontSize: fonte(13) }]}>
                  GALÁXIA {indiceSelecionado + 1}
                </Text>
                <Text style={[styles.nomeNivel, { fontSize: fonte(26) }]}>
                  {secaoSelecionada.nome}
                </Text>
                <Text style={[styles.resumoNivel, { fontSize: fonte(15) }]}>
                  {secaoSelecionada.resumo}
                </Text>

                <View style={styles.barra}>
                  <View
                    style={[
                      styles.barraPreenchida,
                      {
                        width: `${
                          secaoSelecionada.total === 0
                            ? 0
                            : Math.round(
                                (secaoSelecionada.concluidas /
                                  secaoSelecionada.total) *
                                  100
                              )
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View
                style={styles.areaTrilha}
                onLayout={(evento) => {
                  offsetLista.current = evento.nativeEvent.layout.y;
                  setLarguraTrilha(evento.nativeEvent.layout.width);
                  // Espera o layout das estrelas terminar antes de rolar.
                  if (precisaRolar.current) {
                    setTimeout(rolarParaAtual, 80);
                  }
                }}
              >
                {secaoSelecionada.licoes.length > 1 && larguraCaminho > 0 && (
                  <View
                    style={[
                      styles.molduraCaminho,
                      {
                        height:
                          secaoSelecionada.licoes.length * ALTURA_NO + 150,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Image
                      source={CAMINHO_TRILHA}
                      resizeMode="stretch"
                      style={{
                        position: "absolute",
                        top: Y_CENTRO,
                        left: (larguraTrilha - larguraCaminho) / 2,
                        width: larguraCaminho,
                        height: ALTURA_IMAGEM_CAMINHO,
                      }}
                    />
                  </View>
                )}

                {secaoSelecionada.licoes.map((licao, indice) => (
                  <View
                    key={licao.licoes_id}
                    onLayout={(evento) => {
                      posicoes.current[licao.licoes_id] =
                        evento.nativeEvent.layout.y;
                    }}
                  >
                    <NoTrilha
                      licao={licao}
                      offset={
                        secaoSelecionada.licoes.length > 1
                          ? indice % 2 === 0
                            ? deslocamentoCaminho
                            : -deslocamentoCaminho
                          : 0
                      }
                      onPress={aoTocarLicao}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {aviso !== "" && (
        <View
          style={[
            styles.aviso,
            { bottom: Math.max(insets.bottom, 12) + 92 },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Star size={20} color={TrilhaCores.estrela} />
          <Text style={[styles.textoAviso, { fontSize: fonte(16) }]}>
            {aviso}
          </Text>
        </View>
      )}

      {/* Navegação flutuante: a mesma barra das demais telas do app */}
      <BarraNavegacao aba="inicio" />

      <TutorialTrilha visivel={tutorialVisivel} onFechar={fecharTutorial} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    // Planetas e céus são posicionados para fora da tela (right: -110 etc.);
    // sem recorte eles vazam da área roxa e ocupam o espaço do lado de fora,
    // aumentando a página (rolagem horizontal) em web.
    overflow: "hidden",
  },
  rolagem: {
    flex: 1,
  },
  planetaGrande: {
    position: "absolute",
    top: 30,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 214, 81, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  planetaPequeno: {
    position: "absolute",
    bottom: 80,
    left: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(217, 135, 255, 0.09)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  botaoIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    backgroundColor: TrilhaCores.cartao,
    alignItems: "center",
    justifyContent: "center",
  },
  tituloTela: {
    flex: 1,
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.texto,
  },
  botaoAjuda: {
    minHeight: 56,
    minWidth: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    backgroundColor: TrilhaCores.cartao,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  textoAjuda: {
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.texto,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  textoStatus: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    color: TrilhaCores.texto,
  },
  botaoErro: {
    marginTop: 8,
  },
  conteudo: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  linhaResumo: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  chipResumo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: TrilhaCores.cartao,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  textoChip: {
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.texto,
  },
  cartaoExemplo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    backgroundColor: TrilhaCores.cartao,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textoExemplo: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.textoSecundario,
  },
  linhaAbas: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  abasRolagem: {
    flex: 1,
  },
  abasConteudo: {
    gap: 8,
    paddingRight: 8,
  },
  aba: {
    minHeight: 56,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  abaAtiva: {
    backgroundColor: TrilhaCores.abaAtiva,
  },
  abaInativa: {
    backgroundColor: TrilhaCores.abaInativa,
  },
  textoAba: {
    fontFamily: "Poppins_600SemiBold",
  },
  cartaoVazio: {
    marginTop: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    backgroundColor: TrilhaCores.cartao,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  textoVazio: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    color: TrilhaCores.texto,
  },
  cabecalhoNivel: {
    marginTop: 20,
    marginBottom: 2,
    gap: 3,
  },
  areaTrilha: {
    position: "relative",
    marginTop: 8,
  },
  molduraCaminho: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  rotuloGalaxia: {
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.estrela,
    letterSpacing: 1.2,
  },
  nomeNivel: {
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.texto,
  },
  resumoNivel: {
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.textoSecundario,
  },
  barra: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: TrilhaCores.estrela,
  },
  aviso: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TrilhaCores.estrela,
    backgroundColor: "#2B0640",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  textoAviso: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.texto,
  },
});
