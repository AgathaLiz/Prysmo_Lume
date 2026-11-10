import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Lock,
  PartyPopper,
  Pause,
  RotateCcw,
  RotateCw,
  Sparkles,
  Star,
  Trophy,
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
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BotaoGrande } from "@/components/BotaoGrande";
import { CabecalhoLicao } from "@/components/CabecalhoLicao";
import { MolduraCelular } from "@/components/MolduraCelular";
import { PlayerVideo } from "@/components/PlayerVideo";
import { SimuladorCelular } from "@/components/SimuladorCelular";
import { TutorialMimi } from "@/components/TutorialMimi";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  CONTEUDO_EXEMPLO,
  CENARIO_EXEMPLO,
  QUESTOES_EXEMPLO,
} from "@/lib/licao-exemplo";
import {
  ESTRELAS_MAXIMAS,
  NOTA_MINIMA_PADRAO,
  XP_POR_LICAO,
  descreverEstrelas,
  estrelasDaNota,
  foiAprovado,
  notaDaSimulacao,
  notaDoQuestionario,
  notaFinal,
} from "@/lib/nota";
import { obterUsuarioId, salvarResultadoLicao } from "@/lib/progresso";
import { normalizarCenario, type CenarioSimulacao } from "@/lib/simulacao";
import { cenarioParaLicao } from "@/lib/simulacoes-licao";
import { supabase } from "@/lib/supabase";
import {
  AULA_EXEMPLO_ID,
  LICAO_EXEMPLO_ID,
  NIVEL_EXEMPLO_ID,
  comoLista,
  montarTrilha,
  type NivelBanco,
  type ProgressoBanco,
} from "@/lib/trilha";

type Etapa =
  | "intro"
  | "video"
  | "questionario"
  | "simulacao"
  | "resultado"
  | "ofensiva";

const MIMI_FEEDBACK = require("../../assets/Lume/Mimi/Png/mimi-de-frente.png");
const MIMI_FEEDBACK_TRISTE = require("../../assets/Lume/Mimi/Png/mimi-pra-baixo.png");
const LUZ_OFENSIVA = require("../../assets/Lume/Outros elementos/Png/luz-acesa.png");
const ESTRELA_DIA = require("../../assets/Lume/Outros elementos/Png/estrela-cinco-pontas.png");

/** Quantos erros a pessoa pode cometer no questionário antes de a lição reiniciar. */
const VIDAS_MAXIMAS = 2;

// `correta` só existe na lição de exemplo local. As lições do banco NÃO
// recebem essa coluna: o servidor confere a resposta (função verificar_resposta).
type Alternativa = {
  alternativas_id: number;
  texto: string;
  correta?: boolean;
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

const AULA_EXEMPLO: Aula = {
  aulas_id: AULA_EXEMPLO_ID,
  nome: CONTEUDO_EXEMPLO.titulo,
  niveis_id: NIVEL_EXEMPLO_ID,
  aulas_conteudo: CONTEUDO_EXEMPLO,
};

const LICAO_EXEMPLO: Licao = {
  licoes_id: LICAO_EXEMPLO_ID,
  aulas_id: AULA_EXEMPLO_ID,
  aulas: AULA_EXEMPLO,
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
  ofensiva:
    "Esta é a sua ofensiva: os dias seguidos em que você veio aprender. Toque em Continuar para voltar para a trilha.",
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

/** Converte o conteúdo local para o mesmo formato das perguntas do banco. */
function montarQuestoesExemplo(): Questao[] {
  return QUESTOES_EXEMPLO.map((questao, indiceQuestao) => ({
    questoes_id: -(indiceQuestao + 1),
    pergunta: questao.pergunta,
    alternativas: questao.alternativas.map((alternativa, indice) => ({
      alternativas_id: -(indiceQuestao * 10 + indice + 1),
      texto: alternativa.texto,
      correta: alternativa.correta,
    })),
  }));
}

/**
 * Espaço reservado do vídeo, com a moldura de celular do design.
 * O celular ocupa a tela: barra de status, notch, área cinza com os
 * controles e a barra de progresso com o preenchimento em gradiente.
 */
function EspacoVideo({ titulo }: { titulo: string }) {
  const { fonte } = useAcessibilidade();

  return (
    <MolduraCelular preencher>
      <View
        accessible
        accessibilityLabel={`Vídeo da lição ${titulo}. O vídeo ainda não está disponível.`}
        style={styles.areaVideo}
      >
        <View style={styles.controlesVideo}>
          <View style={styles.controleVideo}>
            <RotateCcw size={34} color="#BDBDBD" />
            <Text style={[styles.controleVideoTexto, { fontSize: fonte(11) }]}>
              10
            </Text>
          </View>

          <Pause size={42} color="#BDBDBD" />

          <View style={styles.controleVideo}>
            <RotateCw size={34} color="#BDBDBD" />
            <Text style={[styles.controleVideoTexto, { fontSize: fonte(11) }]}>
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
    </MolduraCelular>
  );
}

export default function LicaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tema, fonte, audioDescricao, falar, pararFala } = useAcessibilidade();
  const navigation = useNavigation();

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
  const [sairVisivel, setSairVisivel] = useState(false);

  // Questionário
  const [indiceQuestao, setIndiceQuestao] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [notaQuiz, setNotaQuiz] = useState<number | null>(null);

  // Gabarito vindo do servidor (só depois de a pessoa responder)
  const [certaId, setCertaId] = useState<number | null>(null);
  const [acertou, setAcertou] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erroVerificar, setErroVerificar] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [explicacaoCerta, setExplicacaoCerta] = useState("");
  const [feedbackVisivel, setFeedbackVisivel] = useState(false);
  const [vidas, setVidas] = useState(VIDAS_MAXIMAS);

  // Simulação
  const [notaSimulacao, setNotaSimulacao] = useState<number | null>(null);

  // Salvamento
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);
  const [erroSalvar, setErroSalvar] = useState("");
  const salvouRef = useRef(false);

  // Saída da lição: o progresso só é salvo no fim, então sair no meio perde tudo.
  const emProgresso =
    etapa === "video" ||
    etapa === "questionario" ||
    etapa === "simulacao" ||
    (etapa === "resultado" && !salvo);
  const emProgressoRef = useRef(emProgresso);
  emProgressoRef.current = emProgresso;
  const permitirSaidaRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acaoPendenteRef = useRef<any>(null);

  // Ofensiva (dias seguidos), lida do servidor na etapa final
  const [ofensiva, setOfensiva] = useState(0);

  // Conquistas ganhas ao salvar este resultado
  const [conquistasNovas, setConquistasNovas] = useState<string[]>([]);

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

    // Lição de demonstração da trilha de exemplo. Não consulta o banco,
    // porque ela é montada só para dar para testar o fluxo completo.
    if (idLicao === LICAO_EXEMPLO_ID) {
      setExemplo(true);
      setLicao(LICAO_EXEMPLO);
      setAula(AULA_EXEMPLO);
      setQuestoes(montarQuestoesExemplo());
      setCenario(CENARIO_EXEMPLO);
      setBloqueada(false);
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
          // ATENÇÃO: sem a coluna `correta`. O gabarito fica só no servidor.
          supabase
            .from("questoes")
            .select("questoes_id, pergunta, alternativas(alternativas_id, texto)")
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
        ? {
            ...aulaEncontrada,
            nome: CONTEUDO_EXEMPLO.titulo,
            aulas_conteudo: CONTEUDO_EXEMPLO,
          }
        : aulaEncontrada;

      const perguntas = usarExemplo ? montarQuestoesExemplo() : perguntasBanco;

      // Toda lição tem simulação. Sem cenário no banco, escolhemos um que
      // combine com o nome da lição (mensagem, ligação, Uber, e-mail, câmera...).
      const cenarioFinal = usarExemplo
        ? CENARIO_EXEMPLO
        : cenarioEncontrado ?? cenarioParaLicao(aulaFinal.nome);

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

  // Toda lição tem vídeo e simulação. O questionário entra quando há
  // perguntas cadastradas.
  const etapasConteudo = useMemo<Etapa[]>(() => {
    const lista: Etapa[] = ["video"];
    if (questoes.length > 0) lista.push("questionario");
    lista.push("simulacao");
    return lista;
  }, [questoes.length]);

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
  const diasSeguidos = Math.max(1, ofensiva);

  // O gabarito vem do servidor, só depois de a pessoa verificar a resposta.
  const alternativaCerta =
    alternativas.find((a) => a.alternativas_id === certaId) ?? null;
  const acertouQuestao = verificado && acertou;
  const semVidas = verificado && !acertou && vidas <= 0;

  // O botão depois da última pergunta depende do que vem a seguir.
  const etapaDepoisDoQuiz =
    etapasConteudo[etapasConteudo.indexOf("questionario") + 1] ?? "resultado";
  const ultimaPergunta = indiceQuestao >= questoes.length - 1;
  const rotuloAvancar = !ultimaPergunta
    ? "Próxima"
    : etapaDepoisDoQuiz === "resultado"
      ? "Ver resultado"
      : "Ir para a prática";

  const tituloFeedback = acertouQuestao
    ? "Isso mesmo!"
    : semVidas
      ? "Acabaram suas vidas"
      : "Quase!";
  const mensagemFeedback = acertouQuestao
    ? explicacao || "Você escolheu a resposta certa. Muito bem!"
    : explicacao || "Essa alternativa não é a correta.";

  const passosDaIntro = useMemo(() => {
    const lista: string[] = ["Assistir a um vídeo"];
    if (questoes.length > 0) lista.push("Responder algumas perguntas");
    lista.push("Praticar no celular de mentirinha");
    return lista;
  }, [questoes.length]);

  /** O que a Mimi fala em cada etapa. Muda junto com o que está na tela. */
  const falaMimi = useMemo(() => {
    if (etapa === "intro") {
      if (passosDaIntro.length === 0) {
        return "Oi! Eu sou a Mimi. Vou ficar com você nesta lição. Não há pressa.";
      }

      const ultimoPasso = passosDaIntro[passosDaIntro.length - 1];
      const listaPassos =
        passosDaIntro.length === 1
          ? ultimoPasso
          : `${passosDaIntro.slice(0, -1).join(", ")} e ${ultimoPasso}`;

      return `Oi! Eu sou a Mimi. Vou ficar com você em cada passo: ${listaPassos.toLowerCase()}. Não há pressa.`;
    }

    if (etapa === "video") {
      return "Assista ao vídeo com calma. Se quiser, veja de novo. Quando terminar, toque em Continuar.";
    }

    if (etapa === "questionario") {
      if (!verificado) {
        return "Leia a pergunta e toque na resposta que parece certa. Depois toque em Verificar. Não tem pressa.";
      }

      if (acertouQuestao) {
        return `Isso mesmo! Você acertou. Toque em ${rotuloAvancar} para continuar.`;
      }
      if (semVidas) {
        return "Suas vidas acabaram, mas tudo bem. Toque em Tentar de novo e vamos recomeçar juntos.";
      }
      return `Quase! A resposta certa está marcada em verde. Toque em ${rotuloAvancar} e vamos juntos.`;
    }

    if (etapa === "simulacao") {
      return "Agora é a sua vez. Leia a instrução e toque na parte certa do celular.";
    }

    if (etapa === "ofensiva") {
      return "Você manteve sua ofensiva! Volte amanhã para continuar aprendendo.";
    }

    if (erroSalvar !== "") {
      return "Suas estrelas estão aqui, mas não consegui salvar. Toque em Tentar salvar de novo.";
    }
    if (salvando) {
      return "Estou guardando o seu resultado. Só um instante.";
    }
    if (aprovado) {
      return `Muito bem! Você ganhou ${estrelas} de ${ESTRELAS_MAXIMAS} estrelas e passou de fase.`;
    }
    return `Você ganhou ${estrelas} de ${ESTRELAS_MAXIMAS} estrelas. Quase lá! Vamos praticar de novo?`;
  }, [
    etapa,
    passosDaIntro,
    verificado,
    acertouQuestao,
    semVidas,
    rotuloAvancar,
    erroSalvar,
    salvando,
    aprovado,
    estrelas,
  ]);

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
      return `${falaMimi} ${partes.join(" ")}`;
    }
    if (etapa === "video") {
      return `${falaMimi} ${
        conteudo?.descricao ??
        "Assista ao vídeo com calma. Você pode ver de novo quando quiser."
      }`;
    }
    if (etapa === "questionario" && questaoAtual) {
      const opcoes = alternativas
        .map((alternativa, indice) => `Opção ${indice + 1}: ${alternativa.texto}`)
        .join(". ");
      return `${questaoAtual.pergunta}. ${opcoes}`;
    }
    if (etapa === "resultado") {
      return `${falaMimi} Sua nota foi ${notaFinalCalculada} por cento.`;
    }
    if (etapa === "ofensiva") {
      return "Você manteve sua ofensiva. Toque em Continuar para voltar para a trilha.";
    }
    return "";
  }, [
    etapa,
    passosDaIntro,
    conteudo,
    questaoAtual,
    alternativas,
    notaFinalCalculada,
    falaMimi,
  ]);

  // Para qualquer fala ao trocar de etapa, ao sair da tela e ao fechar a lição.
  useEffect(() => {
    pararFala();
  }, [etapa, pararFala]);

  useEffect(() => {
    return () => {
      pararFala();
    };
  }, [pararFala]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        pararFala();
      };
    }, [pararFala])
  );

  // Voltar (botão do aparelho, gesto ou seta do navegador) no meio da lição
  // pede confirmação em vez de perder o progresso sem avisar.
  useEffect(() => {
    const remover = navigation.addListener("beforeRemove", (evento) => {
      if (permitirSaidaRef.current || !emProgressoRef.current) return;
      evento.preventDefault();
      acaoPendenteRef.current = evento.data.action;
      setSairVisivel(true);
    });
    return remover;
  }, [navigation]);

  // Na web, avisa também ao fechar ou recarregar a aba.
  useEffect(() => {
    if (Platform.OS !== "web" || !emProgresso || typeof window === "undefined") {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aoFechar = (evento: any) => {
      evento.preventDefault();
      evento.returnValue = "";
    };
    window.addEventListener("beforeunload", aoFechar);
    return () => window.removeEventListener("beforeunload", aoFechar);
  }, [emProgresso]);

  // Audio-descrição: lê a pergunta e o resultado sozinho.
  useEffect(() => {
    if (!audioDescricao) return;
    if (etapa === "questionario" && textoOuvir) falar(textoOuvir);
    if (etapa === "resultado" && textoOuvir) falar(textoOuvir);
    if (etapa === "ofensiva" && textoOuvir) falar(textoOuvir);
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

    setErroSalvar("");

    // A lição de demonstração não tem linha no banco: o resultado serve só
    // para visualizar a tela de feedback e a ofensiva.
    if (licao.licoes_id === LICAO_EXEMPLO_ID) {
      setSalvo(true);
      setXpGanho(XP_POR_LICAO);
      setSalvando(false);
      return;
    }

    setSalvando(true);

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
      setConquistasNovas(resposta.conquistasNovas);
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

  // Ao chegar na etapa da ofensiva, lê a sequência real no servidor.
  useEffect(() => {
    if (etapa !== "ofensiva") return;
    let ativo = true;

    supabase.rpc("ofensiva_atual").then(({ data, error }) => {
      if (!ativo) return;
      if (error) {
        console.log("Erro ao ler a ofensiva:", error.message);
        return;
      }
      setOfensiva(typeof data === "number" ? data : 0);
    });

    return () => {
      ativo = false;
    };
  }, [etapa]);

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
    setConquistasNovas([]);
    setNotaQuiz(null);
    setNotaSimulacao(null);
    setIndiceQuestao(0);
    setSelecionada(null);
    setVerificado(false);
    setAcertos(0);
    setCertaId(null);
    setAcertou(false);
    setVerificando(false);
    setErroVerificar("");
    setExplicacao("");
    setExplicacaoCerta("");
    setFeedbackVisivel(false);
    setVidas(VIDAS_MAXIMAS);

    if (pularVideo) {
      const semVideo = etapasConteudo.find((item) => item !== "video");
      setEtapa(semVideo ?? "resultado");
    } else {
      setEtapa(etapasConteudo[0] ?? "resultado");
    }
  }

  async function verificarResposta() {
    if (!questaoAtual || selecionada === null || verificado || verificando) {
      return;
    }

    setVerificando(true);
    setErroVerificar("");
    let correta = false;
    let idCerta: number | null = null;
    let textoExplicacao = "";
    let textoExplicacaoCerta = "";

    if (selecionada < 0) {
      // Lição de exemplo local: o gabarito está no próprio app.
      const certa = alternativas.find((a) => a.correta);
      idCerta = certa?.alternativas_id ?? null;
      correta = idCerta === selecionada;
    } else {
      // Lição do banco: quem confere é o servidor.
      const { data, error } = await supabase.rpc("verificar_resposta", {
        p_alternativa_id: selecionada,
      });

      if (error || !data || data.length === 0) {
        console.log("Erro ao verificar a resposta:", error?.message);
        setVerificando(false);
        setErroVerificar("Não foi possível verificar agora. Tente de novo.");
        return;
      }

      correta = data[0].acertou;
      idCerta = data[0].alternativa_correta_id;
      // Colunas novas da função: se o banco ainda não foi atualizado, ficam vazias.
      textoExplicacao = String(data[0].explicacao ?? "").trim();
      textoExplicacaoCerta = String(data[0].explicacao_correta ?? "").trim();
    }

    setAcertou(correta);
    setCertaId(idCerta);
    setExplicacao(textoExplicacao);
    setExplicacaoCerta(textoExplicacaoCerta);
    setVerificado(true);
    setVerificando(false);
    setFeedbackVisivel(true);

    if (correta) {
      setAcertos((total) => total + 1);
    } else {
      setVidas((atual) => Math.max(0, atual - 1));
    }

    if (audioDescricao) {
      const textoCerta = alternativas.find(
        (a) => a.alternativas_id === idCerta
      )?.texto;
      if (correta) {
        falar(`Isso mesmo! ${textoExplicacao}`);
      } else {
        falar(
          `Quase! A resposta certa é: ${textoCerta ?? ""}. ${
            textoExplicacaoCerta || textoExplicacao
          }`
        );
      }
    }
  }

  function avancarQuestao() {
    if (!questaoAtual) return;

    const ultima = indiceQuestao >= questoes.length - 1;

    setFeedbackVisivel(false);
    setExplicacao("");
    setExplicacaoCerta("");

    if (ultima) {
      setNotaQuiz(notaDoQuestionario(acertos, questoes.length));
      irParaProximaEtapa("questionario");
      return;
    }

    setIndiceQuestao((indice) => indice + 1);
    setSelecionada(null);
    setVerificado(false);
    setCertaId(null);
    setAcertou(false);
    setErroVerificar("");
  }

  function finalizarSimulacao(erros: number) {
    setNotaSimulacao(notaDaSimulacao(erros));
    setEtapa("resultado");
  }

  function sair() {
    permitirSaidaRef.current = true;
    pararFala();
    if (router.canGoBack()) router.back();
    else router.replace("/trilha" as any);
  }

  function pedirParaSair() {
    // Antes de começar (ou depois de salvar) não há nada a perder.
    if (!emProgressoRef.current) {
      sair();
      return;
    }
    setSairVisivel(true);
  }

  function cancelarSaida() {
    acaoPendenteRef.current = null;
    setSairVisivel(false);
  }

  function confirmarSaida() {
    setSairVisivel(false);
    permitirSaidaRef.current = true;
    pararFala();
    const acao = acaoPendenteRef.current;
    acaoPendenteRef.current = null;
    if (acao) navigation.dispatch(acao);
    else sair();
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
          onFechar={sair}
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
          onFechar={sair}
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
          (etapa === "resultado" || etapa === "ofensiva") && totalEtapas > 0
            ? totalEtapas
            : etapaAtualNumero
        }
        totalEtapas={totalEtapas}
        textoOuvir={textoOuvir || undefined}
        onFechar={pedirParaSair}
        onAjuda={() => {
          setAjudaVisivel(true);
          if (audioDescricao) falar(AJUDA_POR_ETAPA[etapa]);
        }}
      />

      {etapa === "intro" && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoRolavel}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.secao}>
            <TutorialMimi fala={falaMimi} destaque />

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
        </ScrollView>
      )}

      {etapa === "video" && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoEtapa}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.areaMidia}>
            {conteudo?.url_arquivo ? (
              <PlayerVideo url={conteudo.url_arquivo} />
            ) : (
              <EspacoVideo
                titulo={conteudo?.titulo?.trim() || "Vídeo da lição"}
              />
            )}
          </View>

          <BotaoGrande
            titulo="Continuar"
            icone={<ChevronRight size={24} color={tema.texto} />}
            onPress={() => irParaProximaEtapa("video")}
          />
        </ScrollView>
      )}

      {etapa === "questionario" && questaoAtual && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoEtapa}
          showsVerticalScrollIndicator={false}
        >
          <TutorialMimi fala={falaMimi} pose="frente" pequeno />

          <View style={styles.linhaTopoQuiz}>
            <Text style={[styles.contador, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Pergunta {indiceQuestao + 1} de {questoes.length}
            </Text>
            <View
              style={styles.linhaVidas}
              accessible
              accessibilityLabel={`${vidas} de ${VIDAS_MAXIMAS} vidas`}
            >
              {Array.from({ length: VIDAS_MAXIMAS }).map((_, indice) => (
                <Heart
                  key={indice}
                  size={28}
                  color={indice < vidas ? tema.erro : tema.borda}
                  fill={indice < vidas ? tema.erro : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </View>
          </View>

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
            const mostrarCerta =
              verificado && alternativa.alternativas_id === certaId;
            const mostrarErrada =
              verificado &&
              escolhida &&
              alternativa.alternativas_id !== certaId;

            return (
              <TouchableOpacity
                key={alternativa.alternativas_id}
                onPress={() => {
                  if (verificado || verificando) return;
                  setSelecionada(alternativa.alternativas_id);
                  if (audioDescricao) falar(alternativa.texto);
                }}
                disabled={verificado || verificando}
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

          <View style={styles.acoesQuiz}>
            {erroVerificar !== "" && (
              <Text
                style={[
                  styles.erroVerificar,
                  { color: tema.erro, fontSize: fonte(15) },
                ]}
                accessibilityLiveRegion="polite"
              >
                {erroVerificar}
              </Text>
            )}

            {!verificado ? (
              <BotaoGrande
                titulo={verificando ? "Verificando..." : "Verificar"}
                onPress={verificarResposta}
                desabilitado={selecionada === null || verificando}
              />
            ) : (
              <>
                {!feedbackVisivel && (
                  <BotaoGrande
                    titulo="Ver explicação"
                    variante="contorno"
                    onPress={() => setFeedbackVisivel(true)}
                  />
                )}
                {semVidas ? (
                  <BotaoGrande
                    titulo="Tentar de novo"
                    icone={<RotateCcw size={24} color={tema.texto} />}
                    onPress={() => reiniciar(true)}
                  />
                ) : (
                  <BotaoGrande
                    titulo={rotuloAvancar}
                    icone={<ChevronRight size={24} color={tema.texto} />}
                    onPress={avancarQuestao}
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {etapa === "simulacao" && cenario && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoSimulacao}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.areaSimulacao}>
            <SimuladorCelular
              cenario={cenario}
              onFinalizar={finalizarSimulacao}
              preencher
            />
          </View>
        </ScrollView>
      )}

        {etapa === "resultado" && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoRolavel}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.secao}>
            <Image
              source={aprovado ? MIMI_FEEDBACK : MIMI_FEEDBACK_TRISTE}
              style={styles.mimiFeedback}
              resizeMode="contain"
              accessible={false}
            />

            <Text
              style={[styles.tituloResultado, { color: tema.texto, fontSize: fonte(32) }]}
            >
              {aprovado ? "Muito Bem!" : "Quase lá!"}
            </Text>

            <Text
              style={[
                styles.subtituloResultado,
                { color: tema.textoSecundario, fontSize: fonte(18) },
              ]}
            >
              {aprovado
                ? "Você concluiu a lição. A Mimi está orgulhosa!"
                : "Não desanime. Tente de novo, sem pressa."}
            </Text>

            <View style={styles.linhaEstatisticas}>
              <View
                style={[
                  styles.cartaoEstatistica,
                  { backgroundColor: tema.amareloSuave },
                ]}
              >
                <Text style={[styles.rotuloEstatistica, { fontSize: fonte(17) }]}>
                  {questoes.length > 0 ? "Acertos" : "Nota"}
                </Text>
                <View style={styles.caixaEstatistica}>
                  <Text
                    style={[styles.valorEstatistica, { fontSize: fonte(26) }]}
                  >
                    {questoes.length > 0
                      ? `${acertos}/${questoes.length}`
                      : `${notaFinalCalculada}%`}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.cartaoEstatistica, { backgroundColor: tema.roxo }]}
              >
                <Text style={[styles.rotuloEstatistica, { fontSize: fonte(17) }]}>
                  XP
                </Text>
                <View style={styles.caixaEstatistica}>
                  <Text
                    style={[styles.valorEstatistica, { fontSize: fonte(26) }]}
                  >
                    {salvando ? "..." : `+${xpGanho}`}
                  </Text>
                </View>
              </View>
            </View>

            <View
              accessible
              accessibilityLabel={`${estrelas} de ${ESTRELAS_MAXIMAS} estrelas`}
              style={styles.linhaEstrelas}
            >
              {Array.from({ length: ESTRELAS_MAXIMAS }).map((_, indice) => (
                <Star
                  key={indice}
                  size={34}
                  color={indice < estrelas ? "#E0A800" : tema.borda}
                  fill={indice < estrelas ? "#FFD651" : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </View>

            <Text
              style={[
                styles.estrelasTexto,
                { color: tema.texto, fontSize: fonte(18) },
              ]}
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
                <PartyPopper size={24} color={tema.sucesso} />
              ) : (
                <Heart size={24} color={tema.roxoEscuro} />
              )}
              <Text
                style={[
                  styles.textoSelo,
                  {
                    color: aprovado ? tema.sucesso : tema.texto,
                    fontSize: fonte(16),
                  },
                ]}
              >
                {aprovado
                  ? "Você passou de fase!"
                  : "Com 2 estrelas ou mais, a próxima lição abre."}
              </Text>
            </View>

            {conquistasNovas.length > 0 && (
              <View
                style={[styles.seloFase, { backgroundColor: tema.amareloSuave }]}
                accessibilityLiveRegion="polite"
              >
                <Trophy size={24} color="#32064F" />
                <Text
                  style={[
                    styles.textoSelo,
                    { color: "#32064F", fontSize: fonte(16) },
                  ]}
                >
                  {conquistasNovas.length === 1
                    ? "Nova conquista: "
                    : "Novas conquistas: "}
                  {conquistasNovas.join(", ")}
                </Text>
              </View>
            )}

            {aprovado && xpGanho === 0 && salvo && (
              <Text
                style={[
                  styles.texto,
                  { color: tema.textoSecundario, fontSize: fonte(16) },
                ]}
              >
                Você já tinha ganhado o XP desta lição.
              </Text>
            )}

            {exemplo && (
              <Text
                style={[
                  styles.texto,
                  { color: tema.textoSecundario, fontSize: fonte(15) },
                ]}
              >
                Lição de exemplo: o resultado não é salvo.
              </Text>
            )}

            {salvando && (
              <View style={styles.linhaSalvando}>
                <ActivityIndicator size="small" color={tema.roxoEscuro} />
                <Text
                  style={[
                    styles.texto,
                    { color: tema.textoSecundario, fontSize: fonte(16) },
                  ]}
                >
                  Salvando seu resultado...
                </Text>
              </View>
            )}

            {erroSalvar !== "" && (
              <View style={[styles.feedback, { backgroundColor: tema.erroFundo }]}>
                <XCircle size={24} color={tema.erro} />
                <Text
                  style={[
                    styles.textoFeedback,
                    { color: tema.erro, fontSize: fonte(17) },
                  ]}
                >
                  {erroSalvar}
                </Text>
              </View>
            )}

            {aprovado ? (
              <BotaoGrande
                titulo={salvando ? "Salvando..." : "Continuar"}
                variante="roxo"
                carregando={salvando}
                desabilitado={erroSalvar !== ""}
                onPress={() => setEtapa("ofensiva")}
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
        </ScrollView>
      )}

      {etapa === "ofensiva" && (
        <ScrollView
          style={styles.rolagemEtapa}
          contentContainerStyle={styles.conteudoRolavel}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.secao}>
            <Image
              source={LUZ_OFENSIVA}
              style={styles.luzOfensiva}
              resizeMode="contain"
              accessible={false}
            />

            <Text
              style={[styles.tituloResultado, { color: tema.texto, fontSize: fonte(30) }]}
            >
              Dias de Ofensiva
            </Text>

            <Text
              style={[
                styles.textoCalma,
                { color: tema.textoSecundario, fontSize: fonte(17) },
              ]}
            >
              {diasSeguidos === 1
                ? "Você começou sua sequência hoje. Continue assim!"
                : `Você está há ${diasSeguidos} dias seguidos. Continue assim!`}
            </Text>

            <View
              accessible
              accessibilityLabel={`Ofensiva de ${diasSeguidos} ${diasSeguidos === 1 ? "dia" : "dias"}.`}
              style={[
                styles.cartaoOfensiva,
                { backgroundColor: tema.cartao, borderColor: tema.borda },
              ]}
            >
              {[1, 2, 3, 4, 5].map((dia) => {
                // Acende uma estrela por dia seguido (até 5, como no design).
                const ativo = dia <= Math.min(diasSeguidos, 5);

                return (
                  <View key={dia} style={styles.diaOfensiva}>
                    <Text
                      style={[
                        styles.rotuloDia,
                        { color: tema.textoSecundario, fontSize: fonte(13) },
                      ]}
                    >
                      Dia {dia}
                    </Text>
                    <View
                      style={[
                        styles.circuloDia,
                        { backgroundColor: ativo ? "#FFD651" : tema.cartaoSuave },
                      ]}
                    >
                      <Image
                        source={ESTRELA_DIA}
                        style={[styles.estrelaDia, { opacity: ativo ? 1 : 0.22 }]}
                        resizeMode="contain"
                        accessible={false}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <Text
              style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(16) }]}
            >
              Volte amanhã para manter a ofensiva.
            </Text>

            <BotaoGrande titulo="Continuar" variante="roxo" onPress={irParaTrilha} />
          </View>
        </ScrollView>
      )}

      {/* Resposta: acerto ou erro, grande e no centro da tela */}
      <Modal
        visible={feedbackVisivel && verificado && etapa === "questionario"}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackVisivel(false)}
      >
        <View style={styles.fundoModal}>
          <ScrollView
            style={styles.rolagemFeedback}
            contentContainerStyle={styles.centroFeedback}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.cartaoFeedback,
                {
                  backgroundColor: tema.cartao,
                  borderColor: acertouQuestao ? tema.sucesso : tema.erro,
                },
              ]}
              accessibilityViewIsModal
              accessibilityLiveRegion="polite"
            >
              {acertouQuestao ? (
                <CheckCircle2 size={76} color={tema.sucesso} />
              ) : (
                <XCircle size={76} color={tema.erro} />
              )}

              <Text
                style={[
                  styles.tituloFeedback,
                  {
                    color: acertouQuestao ? tema.sucesso : tema.erro,
                    fontSize: fonte(32),
                  },
                ]}
              >
                {tituloFeedback}
              </Text>

              <Text
                style={[
                  styles.corpoFeedback,
                  { color: tema.texto, fontSize: fonte(20) },
                ]}
              >
                {mensagemFeedback}
              </Text>

              {!acertouQuestao && alternativaCerta && (
                <View
                  style={[
                    styles.caixaRespostaCerta,
                    { backgroundColor: tema.sucessoFundo, borderColor: tema.sucesso },
                  ]}
                >
                  <Text
                    style={[
                      styles.rotuloRespostaCerta,
                      { color: tema.sucesso, fontSize: fonte(15) },
                    ]}
                  >
                    A resposta certa é
                  </Text>
                  <Text
                    style={[
                      styles.textoRespostaCerta,
                      { color: tema.texto, fontSize: fonte(19) },
                    ]}
                  >
                    {alternativaCerta.texto}
                  </Text>
                  {explicacaoCerta !== "" && explicacaoCerta !== explicacao && (
                    <Text
                      style={[
                        styles.corpoFeedback,
                        { color: tema.texto, fontSize: fonte(17) },
                      ]}
                    >
                      {explicacaoCerta}
                    </Text>
                  )}
                </View>
              )}

              {!acertouQuestao && (
                <View
                  style={styles.linhaVidas}
                  accessible
                  accessibilityLabel={`${vidas} de ${VIDAS_MAXIMAS} vidas`}
                >
                  {Array.from({ length: VIDAS_MAXIMAS }).map((_, indice) => (
                    <Heart
                      key={indice}
                      size={30}
                      color={indice < vidas ? tema.erro : tema.borda}
                      fill={indice < vidas ? tema.erro : "transparent"}
                      strokeWidth={2}
                    />
                  ))}
                </View>
              )}

              {!acertouQuestao && (
                <Text
                  style={[
                    styles.corpoFeedback,
                    { color: tema.textoSecundario, fontSize: fonte(17) },
                  ]}
                >
                  {semVidas
                    ? "Suas vidas acabaram. Vamos recomeçar as perguntas, sem pressa."
                    : `Você ainda tem ${vidas} ${vidas === 1 ? "vida" : "vidas"}.`}
                </Text>
              )}

              {semVidas ? (
                <BotaoGrande
                  titulo="Tentar de novo"
                  icone={<RotateCcw size={24} color={tema.texto} />}
                  onPress={() => reiniciar(true)}
                />
              ) : (
                <BotaoGrande
                  titulo={rotuloAvancar}
                  icone={<ChevronRight size={24} color={tema.texto} />}
                  onPress={avancarQuestao}
                />
              )}
              <BotaoGrande
                titulo="Ver as alternativas"
                variante="contorno"
                onPress={() => setFeedbackVisivel(false)}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

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

      {/* Confirmação de saída (funciona na web, onde Alert não abre) */}
      <Modal
        visible={sairVisivel}
        transparent
        animationType="fade"
        onRequestClose={cancelarSaida}
      >
        <View style={styles.fundoModal}>
          <View
            style={[styles.cartaoAjuda, { backgroundColor: tema.cartao }]}
            accessibilityViewIsModal
          >
            <Text style={[styles.tituloAjuda, { color: tema.texto, fontSize: fonte(24) }]}>
              Quer sair?
            </Text>
            <Text style={[styles.textoAjuda, { color: tema.textoSecundario, fontSize: fonte(19) }]}>
              Se você sair agora, o progresso desta lição será perdido e você
              vai precisar começar de novo.
            </Text>
            <BotaoGrande
              titulo="Continuar na lição"
              onPress={cancelarSaida}
            />
            <BotaoGrande
              titulo="Sair e perder o progresso"
              variante="contorno"
              onPress={confirmarSaida}
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
  rolagemEtapa: {
    flex: 1,
  },
  conteudoRolavel: {
    padding: 18,
    paddingBottom: 24,
  },
  etapa: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  areaMidia: {
    flex: 1,
    minHeight: 380,
  },
  conteudoEtapa: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 8,
  },
  conteudoSimulacao: {
    flexGrow: 1,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 12,
  },
  areaSimulacao: {
    flex: 1,
    minHeight: 680,
  },
  linhaTopoQuiz: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  linhaVidas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rolagemFeedback: {
    flex: 1,
  },
  centroFeedback: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cartaoFeedback: {
    borderRadius: 28,
    borderWidth: 3,
    padding: 24,
    gap: 14,
    alignItems: "center",
  },
  tituloFeedback: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  corpoFeedback: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  caixaRespostaCerta: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    gap: 4,
    alignItems: "center",
  },
  rotuloRespostaCerta: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
  },
  textoRespostaCerta: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
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
  areaVideo: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
  },
  controlesVideo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
  },
  controleVideo: {
    alignItems: "center",
    justifyContent: "center",
  },
  controleVideoTexto: {
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
    minHeight: 60,
    borderRadius: 18,
    paddingVertical: 12,
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
  acoesQuiz: {
    marginTop: "auto",
    gap: 8,
  },
  erroVerificar: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
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
  mimiFeedback: {
    alignSelf: "center",
    width: 190,
    height: 245,
  },
  subtituloResultado: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
  },
  linhaEstatisticas: {
    flexDirection: "row",
    gap: 12,
  },
  cartaoEstatistica: {
    flex: 1,
    borderRadius: 18,
    padding: 10,
    gap: 8,
    alignItems: "center",
  },
  rotuloEstatistica: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#32064F",
  },
  caixaEstatistica: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  valorEstatistica: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#32064F",
  },
  luzOfensiva: {
    alignSelf: "center",
    width: 190,
    height: 190,
    marginTop: 6,
  },
  cartaoOfensiva: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 4,
  },
  diaOfensiva: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  rotuloDia: {
    fontFamily: "Poppins_600SemiBold",
  },
  circuloDia: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  estrelaDia: {
    width: 30,
    height: 30,
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