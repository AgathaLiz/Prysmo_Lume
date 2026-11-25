import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lock,
  Star,
  WifiOff,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Image,
  Modal,
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
import { BotaoGrande } from "@/components/BotaoGrande";
import { GuiaMimi, useAlvoGuia } from "@/components/GuiaMimi";
import { ALTURA_NO, NoTrilha, Y_CENTRO } from "@/components/NoTrilha";
import { TutorialTrilha } from "@/components/TutorialTrilha";
import { TrilhaCores } from "@/constants/cores";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "@/lib/primeiro-acesso";
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
const MIMI_VOANDO = require("../assets/Lume/Mimi/Png/mimi-voando.png");
const CAMINHO_TRILHA_NOVA = require("../assets/Lume/Outros elementos/Png/trilha-nova.png");

// Linha central normalizada de trilha-nova.png (189x1691) em 33 pontos verticais.
const CURVA_TRILHA_NOVA = [
  0.013, -0.016, -0.026, -0.013, 0.048, 0.169, 0.196, 0.114, -0.05, -0.151,
  -0.106, 0.048, 0.146, 0.095, -0.079, -0.254, -0.296, -0.225, -0.071, 0.122,
  0.28, 0.32, 0.238, 0.016, -0.177, -0.22, -0.159, -0.024, 0.101, 0.161, 0.14,
  -0.026, -0.148,
];

function amostraCurvaTrilha(fracaoY: number): number {
  const f = Math.max(0, Math.min(1, fracaoY)) * (CURVA_TRILHA_NOVA.length - 1);
  const i = Math.floor(f);
  const t = f - i;
  const a = CURVA_TRILHA_NOVA[i];
  const b = CURVA_TRILHA_NOVA[Math.min(i + 1, CURVA_TRILHA_NOVA.length - 1)];
  return a + (b - a) * t;
}

// Estrelinhas decorativas do céu (posição relativa à tela).
const ESTRELAS_FUNDO = [
  { x: 0.08, y: 0.05, r: 1.5, o: 0.65 },
  { x: 0.24, y: 0.09, r: 1.0, o: 0.45 },
  { x: 0.78, y: 0.05, r: 1.8, o: 0.6 },
  { x: 0.91, y: 0.14, r: 1.2, o: 0.5 },
  { x: 0.14, y: 0.28, r: 1.3, o: 0.4 },
  { x: 0.88, y: 0.36, r: 1.6, o: 0.5 },
  { x: 0.06, y: 0.54, r: 1.7, o: 0.45 },
  { x: 0.82, y: 0.64, r: 1.1, o: 0.35 },
  { x: 0.19, y: 0.79, r: 1.4, o: 0.4 },
  { x: 0.93, y: 0.85, r: 1.3, o: 0.35 },
];

const BRILHOS_QUATRO_PONTAS = [
  { x: 0.76, y: 0.04, s: 7, o: 0.6 },
  { x: 0.17, y: 0.38, s: 6, o: 0.45 },
  { x: 0.89, y: 0.52, s: 5, o: 0.4 },
];

function estrelaQuatroPontas(cx: number, cy: number, s: number): string {
  const i = s * 0.24;
  return `M ${cx} ${cy - s} Q ${cx + i} ${cy - i} ${cx + s} ${cy} Q ${cx + i} ${cy + i} ${cx} ${cy + s} Q ${cx - i} ${cy + i} ${cx - s} ${cy} Q ${cx - i} ${cy - i} ${cx} ${cy - s} Z`;
}

export default function TrilhaScreen() {
  const router = useRouter();
  const { fonte, modoEscuro, recarregar, tema } = useAcessibilidade();
  const insets = useSafeAreaInsets();
  const { width: largura, height: altura } = useWindowDimensions();

  const [secoes, setSecoes] = useState<NivelTrilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [tutorialVisivel, setTutorialVisivel] = useState(false);
  const [guiaPrimeiroAcesso, setGuiaPrimeiroAcesso] = useState(false);
  const [nivelSelecionado, setNivelSelecionado] = useState<number | null>(null);
  const [larguraTrilha, setLarguraTrilha] = useState(
    Math.max(0, largura - 32)
  );

  const rolagemRef = useRef<ScrollView>(null);
  const refPrimeiraLicao = useRef<View>(null);
  const refsGuia = useMemo(() => [refPrimeiraLicao], []);
  const { alvo: alvoGuia, remedir: remedirGuia } = useAlvoGuia(
    guiaPrimeiroAcesso && !carregando,
    0,
    refsGuia
  );
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
            setCarregando(false);
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

  useFocusEffect(
    useCallback(() => {
      void carregar();
      void recarregar();
      deveMostrarGuiaTela("trilha").then((mostrar) => {
        if (montado.current && mostrar) setGuiaPrimeiroAcesso(true);
      });
    }, [carregar, recarregar])
  );

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TUTORIAL)
      .then((visto) => {
        if (false && !visto && montado.current) setTutorialVisivel(true);
      })
      .catch(() => {});
  }, []);

  const resumo = useMemo(() => resumoGeral(secoes), [secoes]);
  const vazia = !carregando && !erro && resumo.total === 0;

  const indiceSelecionado = Math.min(
    nivelSelecionado ?? 0,
    Math.max(0, secoes.length - 1)
  );
  const secaoSelecionada = secoes[indiceSelecionado] ?? null;

  const larguraCaminho = useMemo(
    () => Math.min(180, Math.max(130, larguraTrilha * 0.46)),
    [larguraTrilha]
  );

  // Mantém a proporção original de trilha-nova.png (189x1691) sem espremer.
  const alturaNaturalCaminho = useMemo(
    () => larguraCaminho * (1691 / 189),
    [larguraCaminho]
  );

  const alturaVisivelCaminho = useMemo(() => {
    if (!secaoSelecionada || secaoSelecionada.licoes.length === 0) return 0;
    return (secaoSelecionada.licoes.length - 1) * ALTURA_NO + 84;
  }, [secaoSelecionada]);

  const blocosCaminho = useMemo(() => {
    if (alturaNaturalCaminho <= 0 || alturaVisivelCaminho <= 0) return 0;
    return Math.ceil(alturaVisivelCaminho / alturaNaturalCaminho);
  }, [alturaNaturalCaminho, alturaVisivelCaminho]);

  function rolarParaAtual() {
    if (!precisaRolar.current) return;
    const atual = licaoAtual(secoes);
    if (!atual) return;

    const y = posicoes.current[atual.licoes_id];
    if (y === undefined) return;

    precisaRolar.current = false;
    rolagemRef.current?.scrollTo({
      y: Math.max(0, offsetLista.current + y - 160),
      animated: true,
    });
  }

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

    if (guiaPrimeiroAcesso) {
      setGuiaPrimeiroAcesso(false);
      void concluirFluxoEssencial();
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

  const orbsAtivos =
    !secaoSelecionada || secaoSelecionada.total === 0
      ? 0
      : Math.round((secaoSelecionada.concluidas / secaoSelecionada.total) * 4);

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
      {/* Fundo cósmico com nebulosas suaves e estrelinhas */}
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
          <RadialGradient id="nebulaRoxa" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#9B37E1" stopOpacity={0.34} />
            <Stop offset="100%" stopColor="#9B37E1" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nebulaQuente" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E08B5A" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#E08B5A" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nebulaMagenta" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#7A1FB8" stopOpacity={0.32} />
            <Stop offset="100%" stopColor="#7A1FB8" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle
          cx={largura * 0.1}
          cy={altura * 0.34}
          r={largura * 0.55}
          fill="url(#nebulaRoxa)"
        />
        <Circle
          cx={largura * 0.92}
          cy={altura * 0.56}
          r={largura * 0.6}
          fill="url(#nebulaQuente)"
        />
        <Circle
          cx={largura * 0.16}
          cy={altura * 0.88}
          r={largura * 0.52}
          fill="url(#nebulaMagenta)"
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

      {/* Topo limpo: "< Voltar" em amarelo */}
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

        <TouchableOpacity
          onPress={() => setTutorialVisivel(true)}
          accessibilityRole="button"
          accessibilityLabel="Ajuda: como usar a trilha"
          style={styles.botaoAjudaDiscreto}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HelpCircle size={20} color="rgba(255, 214, 81, 0.72)" />
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
              {/* Cartão da Galáxia */}
              <View style={styles.cartaoGalaxia}>
                <Text style={[styles.nomeNivel, { fontSize: fonte(25) }]}>
                  {secaoSelecionada.nome}
                </Text>

                <View style={styles.rodapeGalaxia}>
                  <View style={styles.linhaTituloNivel}>
                    {secoes.length > 1 && (
                      <TouchableOpacity
                        onPress={() =>
                          escolherNivel(Math.max(0, indiceSelecionado - 1))
                        }
                        disabled={indiceSelecionado === 0}
                        accessibilityRole="button"
                        accessibilityLabel="Galáxia anterior"
                        style={[
                          styles.setaDiscreta,
                          indiceSelecionado === 0 && styles.setaDesabilitada,
                        ]}
                      >
                        <ChevronLeft size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}

                    <Text style={[styles.rotuloGalaxia, { fontSize: fonte(14) }]}>
                      GALÁXIA {indiceSelecionado + 1} DE {secoes.length}
                    </Text>

                    {secoes.length > 1 && (
                      <TouchableOpacity
                        onPress={() =>
                          escolherNivel(
                            Math.min(secoes.length - 1, indiceSelecionado + 1)
                          )
                        }
                        disabled={indiceSelecionado >= secoes.length - 1}
                        accessibilityRole="button"
                        accessibilityLabel="Próxima galáxia"
                        style={[
                          styles.setaDiscreta,
                          indiceSelecionado >= secoes.length - 1 &&
                            styles.setaDesabilitada,
                        ]}
                      >
                        <ChevronRight size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 4 círculos de progresso da galáxia */}
                  <View
                    style={styles.linhaOrbs}
                    accessibilityLabel={`Progresso: ${secaoSelecionada.concluidas} de ${secaoSelecionada.total} lições concluídas`}
                  >
                    {Array.from({ length: 4 }).map((_, indice) => {
                      const ativo = indice < orbsAtivos;
                      return (
                        <View
                          key={indice}
                          style={[
                            styles.orbProgresso,
                            ativo && styles.orbProgressoAtivo,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Área da Trilha com caminho S contínuo + Mimi voando + Estrelas */}
              <View
                style={styles.areaTrilha}
                onLayout={(evento) => {
                  offsetLista.current = evento.nativeEvent.layout.y;
                  setLarguraTrilha(evento.nativeEvent.layout.width);
                  if (precisaRolar.current) {
                    setTimeout(rolarParaAtual, 80);
                  }
                }}
              >
                {larguraTrilha > 0 && blocosCaminho > 0 && (
                  <View
                    style={[
                      styles.molduraCaminho,
                      {
                        top: Y_CENTRO,
                        height: alturaVisivelCaminho,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    {Array.from({ length: blocosCaminho }).map((_, bloco) => (
                      <Image
                        key={bloco}
                        source={CAMINHO_TRILHA_NOVA}
                        resizeMode="contain"
                        style={{
                          position: "absolute",
                          top: bloco * alturaNaturalCaminho,
                          left: (larguraTrilha - larguraCaminho) / 2,
                          width: larguraCaminho,
                          height: alturaNaturalCaminho,
                        }}
                      />
                    ))}
                  </View>
                )}

                {/* Mimi flutuando ao lado do início da trilha */}
                <View style={styles.mimiVoando} pointerEvents="none">
                  <Image
                    source={MIMI_VOANDO}
                    resizeMode="contain"
                    style={styles.mimiImagem}
                    accessible={false}
                  />
                </View>

                {secaoSelecionada.licoes.map((licao, indice) => (
                  <View
                    key={licao.licoes_id}
                    ref={indice === 0 ? refPrimeiraLicao : undefined}
                    collapsable={false}
                    onLayout={(evento) => {
                      posicoes.current[licao.licoes_id] =
                        evento.nativeEvent.layout.y;
                      if (indice === 0 && guiaPrimeiroAcesso) {
                        setTimeout(remedirGuia, 100);
                      }
                    }}
                  >
                    <NoTrilha
                      licao={licao}
                      offset={
                        amostraCurvaTrilha(
                          ((indice * ALTURA_NO) % alturaNaturalCaminho) /
                            alturaNaturalCaminho
                        ) * larguraCaminho
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
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setAviso("")}
        >
          <View style={styles.fundoAviso}>
            <View
              style={[
                styles.cartaoAviso,
                { backgroundColor: tema.cartao, borderColor: tema.roxo },
              ]}
              accessibilityViewIsModal
              accessibilityLiveRegion="polite"
            >
              <View style={styles.linhaAviso}>
                <View
                  style={[
                    styles.seloAviso,
                    { backgroundColor: tema.amarelo, borderColor: tema.destaque },
                  ]}
                >
                  <Lock size={26} color="#32064F" strokeWidth={2.4} />
                </View>
                <Text
                  style={[
                    styles.tituloAviso,
                    { color: tema.roxoEscuro, fontSize: fonte(24) },
                  ]}
                >
                  Lição bloqueada
                </Text>
              </View>

              <Text
                style={[styles.textoAviso, { color: tema.texto, fontSize: fonte(18) }]}
              >
                {aviso}
              </Text>

              <BotaoGrande
                titulo="Entendi"
                variante="roxo"
                onPress={() => setAviso("")}
              />
            </View>
          </View>
        </Modal>
      )}

      <BarraNavegacao aba="inicio" />

      <TutorialTrilha visivel={tutorialVisivel} onFechar={fecharTutorial} />

      <GuiaMimi
        visivel={guiaPrimeiroAcesso && !carregando && (secaoSelecionada?.total ?? 0) > 0}
        comBarraInferior
        alvo={alvoGuia}
        texto="Aqui está a sua trilha de aprendizado! Toque nesta primeira estrela amarela para abrir a sua primeira lição."
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
  rolagem: {
    flex: 1,
  },
  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
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
  botaoAjudaDiscreto: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
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
  cartaoGalaxia: {
    borderRadius: 18,
    backgroundColor: TrilhaCores.cartao,
    borderWidth: 1,
    borderColor: TrilhaCores.borda,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  nomeNivel: {
    fontFamily: "Poppins_800ExtraBold",
    color: TrilhaCores.estrela,
    lineHeight: 32,
  },
  rodapeGalaxia: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  linhaTituloNivel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  setaDiscreta: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  setaDesabilitada: {
    opacity: 0.35,
  },
  rotuloGalaxia: {
    fontFamily: "Poppins_600SemiBold",
    color: TrilhaCores.texto,
    letterSpacing: 0.6,
  },
  linhaOrbs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  orbProgresso: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(85, 50, 125, 0.48)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  orbProgressoAtivo: {
    backgroundColor: TrilhaCores.estrela,
    borderColor: TrilhaCores.estrelaBrilho,
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
  areaTrilha: {
    position: "relative",
    marginTop: 6,
  },
  molduraCaminho: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  mimiVoando: {
    position: "absolute",
    top: 20,
    right: 2,
    width: 112,
    height: 112,
    zIndex: 2,
  },
  mimiImagem: {
    width: "100%",
    height: "100%",
  },
  fundoAviso: {
    flex: 1,
    backgroundColor: "rgba(50, 6, 79, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  cartaoAviso: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 3,
    padding: 20,
    gap: 14,
    shadowColor: "#32064F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  linhaAviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  seloAviso: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tituloAviso: {
    flex: 1,
    fontFamily: "Poppins_800ExtraBold",
  },
  textoAviso: {
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 26,
  },
});
