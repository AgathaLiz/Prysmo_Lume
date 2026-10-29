import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Lock,
  PartyPopper,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BotaoGrande } from "@/components/BotaoGrande";
import { CabecalhoLicao } from "@/components/CabecalhoLicao";
import { PlayerVideo } from "@/components/PlayerVideo";
import { SimuladorCelular } from "@/components/SimuladorCelular";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  CONTEUDO_EXEMPLO,
  CENARIO_EXEMPLO,
  QUESTOES_EXEMPLO,
} from "@/lib/licao-exemplo";
import {
  ESTRELAS_MAXIMAS,
  NOTA_MINIMA_PADRAO,
  descreverEstrelas,
  descreverNota,
  estrelasDaNota,
  foiAprovado,
  notaDaSimulacao,
  notaDoQuestionario,
  notaFinal,
} from "@/lib/nota";
import { obterUsuarioId, salvarResultadoLicao } from "@/lib/progresso";
import { normalizarCenario, type CenarioSimulacao } from "@/lib/simulacao";
import { supabase } from "@/lib/supabase";
import {
  comoLista,
  montarTrilha,
  type NivelBanco,
  type ProgressoBanco,
} from "@/lib/trilha";

type Etapa = "intro" | "video" | "questionario" | "simulacao" | "resultado";

type Alternativa = {
  alternativas_id: number;
  texto: string;
  correta: boolean;
};

type Questao = {
  questoes_id: number;
  pergunta: string;
  alternativas: Alternativa[] | null;
};

type Conteudo = {
  titulo: string | null;
  descricao: string | null;
  url_arquivo: string | null;
  tipo: string | null;
};

type Aula = {
  aulas_id: number;
  nome: string;
  niveis_id: number;
  aulas_conteudo: Conteudo | Conteudo[] | null;
};

type Licao = {
  licoes_id: number;
  aulas_id: number;
  aulas: Aula | Aula[] | null;
};

type ChecagemBloqueio = {
  bloqueada: boolean;
  /** Posição da lição na trilha inteira (1 = primeira). */
  posicao: number | null;
};

const AJUDA_POR_ETAPA: Record<Etapa, string> = {
  intro:
    "Leia com calma o que vai acontecer nesta lição. Quando estiver pronto(a), toque em Vamos começar.",
  video:
    "Toque no botão de assistir no vídeo. Se quiser, veja de novo. Depois toque em Continuar.",
  questionario:
    "Leia a pergunta e toque na resposta que você acha certa. Depois toque em Verificar. Não tem pressa.",
  simulacao:
    "Leia a instrução que aparece em cima e toque na parte do celular que combina com ela.",
  resultado:
    "Aqui aparecem suas estrelas. Com 2 estrelas ou mais, você passa de fase. Se quiser, pode tentar de novo.",
};

/** O Supabase devolve objeto ou lista dependendo do relacionamento. */
function normalizarUm<T>(valor: T | T[] | null | undefined): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? valor[0] ?? null : valor;
}

function normalizarLista<T>(valor: T | T[] | null | undefined): T[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function ehVideo(conteudo: Conteudo | null): boolean {
  if (!conteudo) return false;

  const tipo = (conteudo.tipo ?? "").toLowerCase();
  if (tipo.includes("video") || tipo.includes("vídeo")) return true;

  if (!conteudo.url_arquivo) return false;
  return /\.(mp4|mov|m4v|webm|m3u8)(\?|$)/i.test(conteudo.url_arquivo);
}

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Espaço reservado do vídeo, enquanto a gravação não fica pronta. */
function EspacoVideo({ titulo }: { titulo: string }) {
  const { tema, fonte } = useAcessibilidade();

  return (
    <View
      accessible
      accessibilityLabel={`Espaço do vídeo ${titulo}. O vídeo ainda não está disponível.`}
      style={[
        styles.espacoVideo,
        { backgroundColor: tema.cartaoSuave, borderColor: tema.borda },
      ]}
    >
      <View style={[styles.espacoVideoIcone, { backgroundColor: tema.roxoEscuro }]}>
        <Play size={38} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.espacoVideoTitulo, { color: tema.texto, fontSize: fonte(20) }]}
      >
        {titulo}
      </Text>
      <Text
        style={[
          styles.espacoVideoTexto,
          { color: tema.textoSecundario, fontSize: fonte(16) },
        ]}
      >
        O vídeo ainda não está disponível. Você pode seguir para as perguntas.
      </Text>
      <View style={[styles.etiquetaVideo, { backgroundColor: tema.amareloSuave }]}>
        <Text style={[styles.textoEtiqueta, { color: "#32064F", fontSize: fonte(14) }]}>
          EM BREVE
        </Text>
      </View>
    </View>
  );
}

export default function LicaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tema, fonte, audioDescricao, falar } = useAcessibilidade();

  const idLicao = Number(id);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aula, setAula] = useState<Aula | null>(null);
  const [licao, setLicao] = useState<Licao | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [cenario, setCenario] = useState<CenarioSimulacao | null>(null);
  const [bloqueada, setBloqueada] = useState(false);
  const [exemplo, setExemplo] = useState(false);

  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [ajudaVisivel, setAjudaVisivel] = useState(false);

  // Questionário
  const [indiceQuestao, setIndiceQuestao] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [notaQuiz, setNotaQuiz] = useState<number | null>(null);

  // Simulação
  const [notaSimulacao, setNotaSimulacao] = useState<number | null>(null);

  // Salvamento
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);
  const [erroSalvar, setErroSalvar] = useState("");
  const salvouRef = useRef(false);

  const conteudo = normalizarUm(aula?.aulas_conteudo);
  const temVideo = ehVideo(conteudo);
  const semConteudo =
    !temVideo &&
    questoes.length === 0 &&
    cenario === null &&
    !conteudo?.titulo?.trim() &&
    !conteudo?.descricao?.trim();

  const carregarLicao = useCallback(async () => {
    setCarregando(true);
    setErro("");

    if (!Number.isFinite(idLicao)) {
      setErro("Não encontramos esta lição.");
      setCarregando(false);
      return;
    }

    try {
      // Mesma regra da trilha: só abre se a lição anterior foi concluída.
      const consultaBloqueio: Promise<ChecagemBloqueio> = (async () => {
        try {
          const usuarioId = await obterUsuarioId();
          if (!usuarioId) return { bloqueada: false, posicao: null };

          const [respostaNiveis, respostaProgresso] = await Promise.all([
            supabase
              .from("niveis")
              .select(
                "niveis_id, nome, aulas(aulas_id, niveis_id, nome, licoes(licoes_id, aulas_id))"
              )
              .order("niveis_id", { ascending: true }),
            supabase
              .from("progresso_licao")
              .select("licoes_id, concluida")
              .eq("usuario_id", usuarioId),
          ]);

          if (respostaNiveis.error || respostaProgresso.error) {
            return { bloqueada: false, posicao: null };
          }

          const trilha = montarTrilha(
            (respostaNiveis.data ?? []) as unknown as NivelBanco[],
            (respostaProgresso.data ?? []) as ProgressoBanco[]
          );

          const encontrada = trilha
            .flatMap((nivel) => nivel.licoes)
            .find((item) => item.licoes_id === idLicao);

          return {
            bloqueada: encontrada?.estado === "bloqueada",
            posicao: encontrada?.posicao ?? null,
          };
        } catch {
          // Se a checagem falhar, não trava a lição.
          return { bloqueada: false, posicao: null };
        }
      })();

      const [respostaLicao, respostaQuestoes, infoBloqueio, respostaPrimeira] =
        await Promise.all([
          supabase
            .from("licoes")
            .select(
              "licoes_id, aulas_id, aulas(aulas_id, nome, niveis_id, aulas_conteudo(titulo, descricao, url_arquivo, tipo))"
            )
            .eq("licoes_id", idLicao)
            .maybeSingle<Licao>(),
          supabase
            .from("questoes")
            .select(
              "questoes_id, pergunta, alternativas(alternativas_id, texto, correta)"
            )
            .eq("licoes_id", idLicao),
          consultaBloqueio,
          // Usada só para saber se esta é a primeira lição do app.
          supabase
            .from("licoes")
            .select("licoes_id")
            .order("licoes_id", { ascending: true })
            .limit(1)
            .maybeSingle<{ licoes_id: number }>(),
        ]);

      if (respostaLicao.error || !respostaLicao.data) {
        console.log("Erro ao carregar a lição:", respostaLicao.error?.message);
        setErro("Não conseguimos abrir esta lição. Tente de novo.");
        return;
      }

      const aulaEncontrada = normalizarUm(respostaLicao.data.aulas);
      if (!aulaEncontrada) {
        setErro("Esta lição ainda não tem conteúdo.");
        return;
      }

      const estaBloqueada = infoBloqueio.bloqueada;

      if (estaBloqueada) {
        setLicao(respostaLicao.data);
        setAula(aulaEncontrada);
        setBloqueada(true);
        return;
      }

      const conteudoBanco = normalizarUm(aulaEncontrada.aulas_conteudo);
      const videoNoBanco = ehVideo(conteudoBanco);

      const perguntasBanco = ((respostaQuestoes.data ?? []) as Questao[])
        .map((questao) => ({
          ...questao,
          alternativas: normalizarLista(questao.alternativas).sort(
            (a, b) => a.alternativas_id - b.alternativas_id
          ),
        }))
        // Pergunta sem alternativa não tem como ser respondida: ignora.
        .filter((questao) => questao.alternativas.length > 0)
        .sort((a, b) => a.questoes_id - b.questoes_id);

      // A tabela `simulacoes` pode ainda não existir: nesse caso a lição
      // simplesmente não tem a etapa de simulação.
      let cenarioEncontrado: CenarioSimulacao | null = null;
      const respostaSimulacao = await supabase
        .from("simulacoes")
        .select("tipo, passos")
        .eq("licoes_id", idLicao)
        .limit(1)
        .maybeSingle<{ tipo: string | null; passos: unknown }>();

      if (respostaSimulacao.error) {
        console.log(
          "Simulação indisponível:",
          respostaSimulacao.error.message
        );
      } else if (respostaSimulacao.data) {
        cenarioEncontrado = normalizarCenario(
          respostaSimulacao.data.passos,
          respostaSimulacao.data.tipo
        );
      }

      /**
       * A primeira lição ainda não tem conteúdo no banco. Até o cadastro
       * ser feito, ela usa a lição de exemplo local (salvar um contato),
       * então a pessoa já consegue fazer o caminho completo.
       * Se o banco já tiver qualquer etapa, o conteúdo do banco vence.
       */
      const ehPrimeiraLicao =
        infoBloqueio.posicao === 1 ||
        respostaPrimeira.data?.licoes_id === idLicao;
      const bancoSemConteudo =
        !videoNoBanco &&
        perguntasBanco.length === 0 &&
        cenarioEncontrado === null;
      const usarExemplo = ehPrimeiraLicao && bancoSemConteudo;

      const aulaFinal = usarExemplo
        ? { ...aulaEncontrada, aulas_conteudo: CONTEUDO_EXEMPLO }
        : aulaEncontrada;

      const perguntas = usarExemplo
        ? QUESTOES_EXEMPLO.map((questao, indiceQuestao) => ({
            questoes_id: -(indiceQuestao + 1),
            pergunta: questao.pergunta,
            alternativas: questao.alternativas.map((alternativa, indice) => ({
              alternativas_id: -(indiceQuestao * 10 + indice + 1),
              texto: alternativa.texto,
              correta: alternativa.correta,
            })),
          }))
        : perguntasBanco;

      const cenarioFinal = usarExemplo ? CENARIO_EXEMPLO : cenarioEncontrado;

      setExemplo(usarExemplo);
      setLicao(respostaLicao.data);
      setAula(aulaFinal);
      setQuestoes(perguntas);
      setCenario(cenarioFinal);
    } catch (erroCarregar) {
      console.log("Erro inesperado na lição:", erroCarregar);
      setErro("Parece que a internet falhou. Vamos tentar de novo?");
    } finally {
      setCarregando(false);
    }
  }, [idLicao]);

  useEffect(() => {
    void carregarLicao();
  }, [carregarLicao]);

  // Quais etapas esta lição realmente tem (montadas a partir dos dados).
  const etapasConteudo = useMemo<Etapa[]>(() => {
    const lista: Etapa[] = [];
    if (temVideo) lista.push("video");
    if (questoes.length > 0) lista.push("questionario");
    if (cenario) lista.push("simulacao");
    return lista;
  }, [temVideo, questoes.length, cenario]);

  const totalEtapas = etapasConteudo.length;
  const indiceEtapaAtual = etapasConteudo.indexOf(etapa);
  const etapaAtualNumero = indiceEtapaAtual >= 0 ? indiceEtapaAtual + 1 : null;

  const questaoAtual = questoes[indiceQuestao] ?? null;

  // Embaralha uma vez por pergunta (não muda a cada toque).
  const alternativas = useMemo(
    () => embaralhar(questaoAtual?.alternativas ?? []),
    [questaoAtual]
  );

  const notaFinalCalculada = useMemo(
    () => notaFinal({ questionario: notaQuiz, simulacao: notaSimulacao }),
    [notaQuiz, notaSimulacao]
  );

  const aprovado = foiAprovado(notaFinalCalculada, NOTA_MINIMA_PADRAO);
  const estrelas = estrelasDaNota(notaFinalCalculada);

  const alternativaCerta = alternativas.find((a) => a.correta) ?? null;
  const acertouQuestao =
    verificado &&
    selecionada !== null &&
    alternativaCerta?.alternativas_id === selecionada;

  const passosDaIntro = useMemo(() => {
    const lista: string[] = [];
    if (temVideo) lista.push("Assistir a um vídeo");
    if (questoes.length > 0) lista.push("Responder algumas perguntas");
    if (cenario) lista.push("Praticar no celular de mentirinha");
    return lista;
  }, [temVideo, questoes.length, cenario]);

  const tituloLicao = aula?.nome ?? "Lição";

  const textoOuvir = useMemo(() => {
    if (etapa === "intro") {
      const partes: string[] = [];
      if (conteudo?.titulo?.trim()) partes.push(conteudo.titulo.trim());
      if (conteudo?.descricao?.trim()) partes.push(conteudo.descricao.trim());
      if (passosDaIntro.length > 0) {
        partes.push(`Nesta lição você vai: ${passosDaIntro.join(", ")}.`);
      }
      partes.push("Não há pressa.");
      return partes.join(" ");
    }
    if (etapa === "video") {
      return (
        conteudo?.descricao ??
        "Assista ao vídeo com calma. Você pode ver de novo quando quiser."
      );
    }
    if (etapa === "questionario" && questaoAtual) {
      const opcoes = alternativas
        .map((alternativa, indice) => `Opção ${indice + 1}: ${alternativa.texto}`)
        .join(". ");
      return `${questaoAtual.pergunta}. ${opcoes}`;
    }
    if (etapa === "resultado") {
      return aprovado
        ? `Parabéns! Você ganhou ${estrelas} de ${ESTRELAS_MAXIMAS} estrelas. Sua nota foi ${notaFinalCalculada} por cento.`
        : `Você ganhou ${estrelas} de ${ESTRELAS_MAXIMAS} estrelas. Sua nota foi ${notaFinalCalculada} por cento. Você foi bem, mas vale praticar mais um pouco.`;
    }
    return "";
  }, [
    etapa,
    passosDaIntro,
    conteudo,
    questaoAtual,
    alternativas,
    aprovado,
    notaFinalCalculada,
    estrelas,
  ]);

  // Audio-descrição: lê a pergunta e o resultado sozinho.
  useEffect(() => {
    if (!audioDescricao) return;
    if (etapa === "questionario" && textoOuvir) falar(textoOuvir);
    if (etapa === "resultado" && textoOuvir) falar(textoOuvir);
  }, [audioDescricao, etapa, textoOuvir, falar]);

  /** Descobre se esta é a última lição do nível e qual nível liberar. */
  async function descobrirProximoNivel(
    niveisId: number,
    licoesId: number
  ): Promise<number | null> {
    try {
      const { data: aulas, error } = await supabase
        .from("aulas")
        .select("aulas_id, licoes(licoes_id)")
        .eq("niveis_id", niveisId)
        .order("aulas_id", { ascending: true });

      if (error || !aulas) return null;

      const ids: number[] = [];
      for (const item of aulas as unknown as {
        licoes: { licoes_id: number } | { licoes_id: number }[] | null;
      }[]) {
        const lista = comoLista(item.licoes).sort(
          (a, b) => a.licoes_id - b.licoes_id
        );
        for (const licaoItem of lista) ids.push(licaoItem.licoes_id);
      }

      if (ids[ids.length - 1] !== licoesId) return null;

      const { data: niveis } = await supabase
        .from("niveis")
        .select("niveis_id")
        .order("niveis_id", { ascending: true });

      if (!niveis) return null;

      const lista = niveis as { niveis_id: number }[];
      const posicao = lista.findIndex((nivel) => nivel.niveis_id === niveisId);
      if (posicao < 0) return null;

      return lista[posicao + 1]?.niveis_id ?? null;
    } catch {
      return null;
    }
  }

  const salvar = useCallback(async () => {
    if (!licao || salvando) return;

    setSalvando(true);
    setErroSalvar("");

    const proximoNivelId =
      aprovado && aula
        ? await descobrirProximoNivel(aula.niveis_id, licao.licoes_id)
        : null;

    const resposta = await salvarResultadoLicao({
      licaoId: licao.licoes_id,
      notaQuestionario: notaQuiz,
      notaSimulacao,
      notaFinal: notaFinalCalculada,
      aprovado,
      proximoNivelId,
    });

    if (resposta.ok) {
      setSalvo(true);
      setXpGanho(resposta.xpGanho);
    } else {
      setErroSalvar(resposta.mensagem);
    }

    setSalvando(false);
  }, [
    licao,
    salvando,
    aprovado,
    aula,
    notaQuiz,
    notaSimulacao,
    notaFinalCalculada,
  ]);

  // Ao chegar no resultado, salva uma única vez.
  useEffect(() => {
    if (etapa !== "resultado") return;
    if (salvouRef.current) return;
    salvouRef.current = true;
    void salvar();
  }, [etapa, salvar]);

  function irParaProximaEtapa(etapaAtual: Etapa) {
    const posicao = etapasConteudo.indexOf(etapaAtual);
    const proxima = etapasConteudo[posicao + 1];
    setEtapa(proxima ?? "resultado");
  }

  function comecar() {
    setEtapa(etapasConteudo[0] ?? "resultado");
  }

  function reiniciar(pularVideo: boolean) {
    salvouRef.current = false;
    setSalvo(false);
    setErroSalvar("");
    setXpGanho(0);
    setNotaQuiz(null);
    setNotaSimulacao(null);
    setIndiceQuestao(0);
    setSelecionada(null);
    setVerificado(false);
    setAcertos(0);

    if (pularVideo) {
      const semVideo = etapasConteudo.find((item) => item !== "video");
      setEtapa(semVideo ?? "resultado");
    } else {
      setEtapa(etapasConteudo[0] ?? "resultado");
    }
  }

  function verificarResposta() {
    if (!questaoAtual || selecionada === null || verificado) return;

    const escolhida = alternativas.find(
      (alternativa) => alternativa.alternativas_id === selecionada
    );

    setVerificado(true);
    if (escolhida?.correta) {
      setAcertos((total) => total + 1);
      if (audioDescricao) falar("Isso mesmo!");
    } else if (audioDescricao) {
      falar("Quase! Vamos ver a resposta certa.");
    }
  }

  function avancarQuestao() {
    if (!questaoAtual) return;

    const ultima = indiceQuestao >= questoes.length - 1;

    if (ultima) {
      setNotaQuiz(notaDoQuestionario(acertos, questoes.length));
      irParaProximaEtapa("questionario");
      return;
    }

    setIndiceQuestao((indice) => indice + 1);
    setSelecionada(null);
    setVerificado(false);
  }

  function finalizarSimulacao(erros: number) {
    setNotaSimulacao(notaDaSimulacao(erros));
    setEtapa("resultado");
  }

  function sair() {
    if (router.canGoBack()) router.back();
    else router.replace("/trilha" as any);
  }

  function pedirParaSair() {
    Alert.alert("Quer sair?", "Você poderá voltar depois.", [
      { text: "Ficar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: sair },
    ]);
  }

  function irParaTrilha() {
    sair();
  }

  // ---------- Telas de carregamento / erro ----------

  if (carregando) {
    return (
      <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
        <CabecalhoLicao
          titulo="Lição"
          etapaAtual={null}
          totalEtapas={0}
          onFechar={pedirParaSair}
          onAjuda={() => setAjudaVisivel(true)}
        />
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={tema.roxoEscuro} />
          <Text style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(19) }]}>
            Preparando sua lição...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bloqueada) {
    return (
      <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
        <CabecalhoLicao
          titulo={tituloLicao}
          etapaAtual={null}
          totalEtapas={0}
          onFechar={sair}
          onAjuda={() => setAjudaVisivel(true)}
        />
        <View style={styles.centro}>
          <Lock size={52} color={tema.textoSecundario} />
          <Text
            style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(22) }]}
          >
            Esta lição ainda está bloqueada
          </Text>
          <Text
            style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(18) }]}
          >
            Termine a lição anterior para abrir esta. Sem pressa!
          </Text>
          <BotaoGrande
            titulo="Voltar para a trilha"
            onPress={sair}
            estilo={styles.botaoCentro}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (erro || !licao || !aula) {
    return (
      <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
        <CabecalhoLicao
          titulo="Lição"
          etapaAtual={null}
          totalEtapas={0}
          onFechar={pedirParaSair}
          onAjuda={() => setAjudaVisivel(true)}
        />
        <View style={styles.centro}>
          <Text style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(19) }]}>
            {erro || "Não encontramos esta lição."}
          </Text>
          <BotaoGrande
            titulo="Tentar de novo"
            onPress={() => void carregarLicao()}
            estilo={styles.botaoCentro}
          />
          <BotaoGrande
            titulo="Voltar para a trilha"
            variante="contorno"
            onPress={sair}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Lição sem nenhum conteúdo ainda: não deixa "concluir" sem aprender nada.
  if (semConteudo) {
    return (
      <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
        <CabecalhoLicao
          titulo={tituloLicao}
          etapaAtual={null}
          totalEtapas={0}
          onFechar={sair}
          onAjuda={() => setAjudaVisivel(true)}
        />
        <View style={styles.centro}>
          <Sparkles size={52} color={tema.roxoEscuro} />
          <Text
            style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(22) }]}
          >
            Esta lição ainda está sendo preparada
          </Text>
          <Text
            style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(18) }]}
          >
            Em breve ela terá vídeo, perguntas e prática. Enquanto isso,
            você pode voltar para a trilha.
          </Text>
          <BotaoGrande
            titulo="Voltar para a trilha"
            onPress={sair}
            estilo={styles.botaoCentro}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Conteúdo ----------

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
      <CabecalhoLicao
        titulo={tituloLicao}
        etapaAtual={
          etapa === "resultado" && totalEtapas > 0 ? totalEtapas : etapaAtualNumero
        }
        totalEtapas={totalEtapas}
        textoOuvir={textoOuvir || undefined}
        onFechar={pedirParaSair}
        onAjuda={() => {
          setAjudaVisivel(true);
          if (audioDescricao) falar(AJUDA_POR_ETAPA[etapa]);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.conteudoTela}
        showsVerticalScrollIndicator={false}
      >
        {etapa === "intro" && (
          <View style={styles.secao}>
            <View style={styles.linhaMascote}>
              <Image
                source={require("../../assets/Lume/Mimi/Png/mimi-ensinando.png")}
                style={styles.mascote}
                resizeMode="contain"
              />
              <View
                style={[
                  styles.balao,
                  { backgroundColor: tema.amareloSuave },
                ]}
              >
                <Text style={[styles.textoBalao, { color: tema.texto, fontSize: fonte(18) }]}>
                  Vamos aprender juntos, com calma.
                </Text>
              </View>
            </View>

            <Text style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(26) }]}>
              Nesta lição você vai:
            </Text>

            {exemplo && (
              <View style={[styles.etiquetaExemplo, { backgroundColor: tema.amareloSuave }]}>
                <Sparkles size={18} color="#32064F" />
                <Text style={[styles.textoEtiqueta, { color: "#32064F", fontSize: fonte(14) }]}>
                  LIÇÃO DE EXEMPLO
                </Text>
              </View>
            )}

            {conteudo && (conteudo.titulo || conteudo.descricao) ? (
              <View
                style={[
                  styles.cartaoTexto,
                  { backgroundColor: tema.cartao, borderColor: tema.borda },
                ]}
              >
                {conteudo.titulo?.trim() ? (
                  <Text
                    style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(22) }]}
                  >
                    {conteudo.titulo}
                  </Text>
                ) : null}
                {conteudo.descricao?.trim() ? (
                  <Text
                    style={[
                      styles.texto,
                      { color: tema.textoSecundario, fontSize: fonte(18) },
                    ]}
                  >
                    {conteudo.descricao}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {passosDaIntro.length === 0 ? (
              <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(18) }]}>
                Esta lição não tem vídeo, perguntas nem simulação. Toque em
                continuar para concluir.
              </Text>
            ) : (
              passosDaIntro.map((passo, indice) => (
                <View key={passo} style={styles.linhaPasso}>
                  <View style={[styles.numeroPasso, { backgroundColor: tema.roxo }]}>
                    <Text style={[styles.numeroTexto, { color: "#32064F", fontSize: fonte(18) }]}>
                      {indice + 1}
                    </Text>
                  </View>
                  <Text style={[styles.textoPasso, { color: tema.texto, fontSize: fonte(20) }]}>
                    {passo}
                  </Text>
                </View>
              ))
            )}

            <Text style={[styles.textoCalma, { color: tema.textoSecundario, fontSize: fonte(17) }]}>
              Não há pressa. Você pode repetir quantas vezes quiser.
            </Text>

            <BotaoGrande
              titulo={etapasConteudo.length === 0 ? "Concluir lição" : "Vamos começar"}
              onPress={comecar}
            />
          </View>
        )}

        {etapa === "video" && (
          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(24) }]}>
              {conteudo?.titulo?.trim() || "Assista ao vídeo"}
            </Text>

            {conteudo?.descricao ? (
              <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(18) }]}>
                {conteudo.descricao}
              </Text>
            ) : null}

            {conteudo?.url_arquivo ? (
              <PlayerVideo url={conteudo.url_arquivo} />
            ) : (
              <EspacoVideo
                titulo={conteudo?.titulo?.trim() || "Vídeo da lição"}
              />
            )}

            <BotaoGrande
              titulo="Continuar"
              icone={<ChevronRight size={24} color={tema.texto} />}
              onPress={() => irParaProximaEtapa("video")}
            />
            <Text style={[styles.textoCalma, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Você pode continuar sem assistir até o fim.
            </Text>
          </View>
        )}

        {etapa === "questionario" && questaoAtual && (
          <View style={styles.secao}>
            <Text style={[styles.contador, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Pergunta {indiceQuestao + 1} de {questoes.length}
            </Text>

            <View style={[styles.barra, { backgroundColor: tema.borda }]}>
              <View
                style={[
                  styles.barraPreenchida,
                  {
                    width: `${Math.round(((indiceQuestao + (verificado ? 1 : 0)) / questoes.length) * 100)}%`,
                    backgroundColor: tema.roxoEscuro,
                  },
                ]}
              />
            </View>

            <Text style={[styles.pergunta, { color: tema.texto, fontSize: fonte(24) }]}>
              {questaoAtual.pergunta}
            </Text>

            {alternativas.map((alternativa) => {
              const escolhida = selecionada === alternativa.alternativas_id;
              const mostrarCerta = verificado && alternativa.correta;
              const mostrarErrada = verificado && escolhida && !alternativa.correta;

              return (
                <TouchableOpacity
                  key={alternativa.alternativas_id}
                  onPress={() => {
                    if (verificado) return;
                    setSelecionada(alternativa.alternativas_id);
                    if (audioDescricao) falar(alternativa.texto);
                  }}
                  disabled={verificado}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: escolhida, disabled: verificado }}
                  accessibilityLabel={alternativa.texto}
                  style={[
                    styles.alternativa,
                    {
                      backgroundColor: tema.cartao,
                      borderColor: escolhida ? tema.roxoEscuro : tema.borda,
                      borderWidth: escolhida ? 3 : 1,
                    },
                    mostrarCerta && {
                      borderColor: tema.sucesso,
                      borderWidth: 3,
                      backgroundColor: tema.sucessoFundo,
                    },
                    mostrarErrada && {
                      borderColor: tema.erro,
                      borderWidth: 3,
                      backgroundColor: tema.erroFundo,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.marcador,
                      {
                        borderColor: escolhida ? tema.roxoEscuro : tema.textoSecundario,
                        backgroundColor: escolhida ? tema.roxoEscuro : "transparent",
                      },
                    ]}
                  />

                  <Text style={[styles.textoAlternativa, { color: tema.texto, fontSize: fonte(19) }]}>
                    {alternativa.texto}
                  </Text>

                  {mostrarCerta && <CheckCircle2 size={26} color={tema.sucesso} />}
                  {mostrarErrada && <XCircle size={26} color={tema.erro} />}
                </TouchableOpacity>
              );
            })}

            {verificado && (
              <View
                style={[
                  styles.feedback,
                  {
                    backgroundColor: acertouQuestao
                      ? tema.sucessoFundo
                      : tema.erroFundo,
                  },
                ]}
                accessibilityLiveRegion="polite"
              >
                {acertouQuestao ? (
                  <CheckCircle2 size={26} color={tema.sucesso} />
                ) : (
                  <XCircle size={26} color={tema.erro} />
                )}
                <Text
                  style={[
                    styles.textoFeedback,
                    {
                      color: acertouQuestao ? tema.sucesso : tema.erro,
                      fontSize: fonte(18),
                    },
                  ]}
                >
                  {acertouQuestao
                    ? "Isso mesmo! Você acertou."
                    : alternativaCerta
                      ? `Quase! A resposta certa é: ${alternativaCerta.texto}`
                      : "Vamos seguir em frente."}
                </Text>
              </View>
            )}

            {!verificado ? (
              <BotaoGrande
                titulo="Verificar"
                onPress={verificarResposta}
                desabilitado={selecionada === null}
              />
            ) : (
              <BotaoGrande
                titulo={
                  indiceQuestao >= questoes.length - 1 ? "Ver resultado" : "Próxima"
                }
                icone={<ChevronRight size={24} color={tema.texto} />}
                onPress={avancarQuestao}
              />
            )}
          </View>
        )}

        {etapa === "simulacao" && cenario && (
          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(24) }]}>
              {cenario.titulo?.trim() || "Pratique no celular"}
            </Text>
            <SimuladorCelular cenario={cenario} onFinalizar={finalizarSimulacao} />
          </View>
        )}

        {etapa === "resultado" && (
          <View style={styles.secao}>
            <Text style={[styles.tituloResultado, { color: tema.texto, fontSize: fonte(30) }]}>
              {estrelas >= 3 ? "Perfeito!" : aprovado ? "Parabéns!" : "Quase lá!"}
            </Text>

            <View
              accessible
              accessibilityLabel={`${estrelas} de ${ESTRELAS_MAXIMAS} estrelas`}
              style={styles.linhaEstrelas}
            >
              {Array.from({ length: ESTRELAS_MAXIMAS }).map((_, indice) => (
                <Star
                  key={indice}
                  size={54}
                  color={indice < estrelas ? "#E0A800" : tema.borda}
                  fill={indice < estrelas ? "#FFD651" : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </View>

            <Text
              style={[styles.estrelasTexto, { color: tema.texto, fontSize: fonte(21) }]}
            >
              {descreverEstrelas(estrelas)}
            </Text>

            <View
              style={[
                styles.seloFase,
                { backgroundColor: aprovado ? tema.sucessoFundo : tema.cartaoSuave },
              ]}
              accessibilityLiveRegion="polite"
            >
              {aprovado ? (
                <PartyPopper size={26} color={tema.sucesso} />
              ) : (
                <Heart size={26} color={tema.roxoEscuro} />
              )}
              <Text
                style={[
                  styles.textoSelo,
                  { color: aprovado ? tema.sucesso : tema.texto, fontSize: fonte(17) },
                ]}
              >
                {aprovado
                  ? "Você passou de fase!"
                  : "Você ainda não passou. Tente de novo!"}
              </Text>
            </View>

            <Text style={[styles.nota, { color: tema.texto, fontSize: fonte(30) }]}>
              {notaFinalCalculada}% de acerto
            </Text>

            <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(18) }]}>
              {descreverNota(notaFinalCalculada)}
            </Text>

            <Text
              style={[styles.textoCalma, { color: tema.textoSecundario, fontSize: fonte(16) }]}
            >
              Com 2 estrelas ou mais, a próxima lição abre.
            </Text>

            {aprovado && xpGanho > 0 && (
              <Text style={[styles.xp, { color: tema.roxoEscuro, fontSize: fonte(22) }]}>
                +{xpGanho} XP
              </Text>
            )}

            {aprovado && xpGanho === 0 && salvo && (
              <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Você já tinha ganhado o XP desta lição.
              </Text>
            )}

            {salvando && (
              <View style={styles.linhaSalvando}>
                <ActivityIndicator size="small" color={tema.roxoEscuro} />
                <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                  Salvando seu resultado...
                </Text>
              </View>
            )}

            {erroSalvar !== "" && (
              <View style={[styles.feedback, { backgroundColor: tema.erroFundo }]}>
                <XCircle size={24} color={tema.erro} />
                <Text style={[styles.textoFeedback, { color: tema.erro, fontSize: fonte(17) }]}>
                  {erroSalvar}
                </Text>
              </View>
            )}

            {aprovado ? (
              <BotaoGrande
                titulo={salvando ? "Salvando..." : "Voltar para a trilha"}
                carregando={salvando}
                onPress={irParaTrilha}
              />
            ) : (
              <>
                <BotaoGrande
                  titulo="Tentar de novo"
                  icone={<RotateCcw size={24} color={tema.texto} />}
                  onPress={() => reiniciar(true)}
                />
                {temVideo && (
                  <BotaoGrande
                    titulo="Ver o vídeo de novo"
                    variante="contorno"
                    onPress={() => reiniciar(false)}
                  />
                )}
              </>
            )}

            {erroSalvar !== "" && (
              <BotaoGrande
                titulo="Tentar salvar de novo"
                variante="contorno"
                carregando={salvando}
                onPress={() => void salvar()}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Ajuda de cada etapa */}
      <Modal
        visible={ajudaVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setAjudaVisivel(false)}
      >
        <View style={styles.fundoModal}>
          <View
            style={[styles.cartaoAjuda, { backgroundColor: tema.cartao }]}
            accessibilityViewIsModal
          >
            <Text style={[styles.tituloAjuda, { color: tema.texto, fontSize: fonte(24) }]}>
              O que fazer agora?
            </Text>
            <Text style={[styles.textoAjuda, { color: tema.textoSecundario, fontSize: fonte(19) }]}>
              {AJUDA_POR_ETAPA[etapa]}
            </Text>
            <BotaoGrande
              titulo="Entendi"
              onPress={() => setAjudaVisivel(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudoTela: {
    padding: 18,
    paddingBottom: 48,
  },
  secao: {
    gap: 14,
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
  },
  botaoCentro: {
    marginTop: 8,
  },
  linhaMascote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mascote: {
    width: 90,
    height: 130,
  },
  balao: {
    flex: 1,
    borderRadius: 24,
    padding: 14,
  },
  cartaoTexto: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  etiquetaExemplo: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoEtiqueta: {
    fontFamily: "Poppins_800ExtraBold",
    letterSpacing: 0.5,
  },
  espacoVideo: {
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
  },
  espacoVideoIcone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  espacoVideoTitulo: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  espacoVideoTexto: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
  },
  etiquetaVideo: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  textoBalao: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  tituloSecao: {
    fontFamily: "Poppins_800ExtraBold",
  },
  texto: {
    fontFamily: "Poppins_300Light",
  },
  textoCalma: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  linhaPasso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  numeroPasso: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    fontFamily: "Poppins_800ExtraBold",
  },
  textoPasso: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  contador: {
    fontFamily: "Poppins_600SemiBold",
  },
  barra: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 5,
  },
  pergunta: {
    fontFamily: "Poppins_800ExtraBold",
    marginTop: 4,
  },
  alternativa: {
    minHeight: 64,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  marcador: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  textoAlternativa: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
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
  linhaEstrelas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  estrelasTexto: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  seloFase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    padding: 14,
  },
  textoSelo: {
    fontFamily: "Poppins_600SemiBold",
    flexShrink: 1,
  },
  tituloResultado: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  nota: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  xp: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  linhaSalvando: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 22,
  },
  cartaoAjuda: {
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  tituloAjuda: {
    fontFamily: "Poppins_800ExtraBold",
  },
  textoAjuda: {
    fontFamily: "Poppins_300Light",
  },
});
