import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Lock, Sparkles, X } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarraStatus } from "@/components/BarraStatus";
import { BotaoGrande } from "@/components/BotaoGrande";
import { IntroLicao } from "@/components/IntroLicao";
import { OfensivaLicao } from "@/components/OfensivaLicao";
import { PopupMuitoBem } from "@/components/PopupMuitoBem";
import { QuizLicao } from "@/components/QuizLicao";
import { ResultadoLicao } from "@/components/ResultadoLicao";
import { SimuladorCelular } from "@/components/SimuladorCelular";
import { VideoLicao } from "@/components/VideoLicao";
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
  estrelasDaNota,
  foiAprovado,
  notaDaSimulacao,
  notaDoQuestionario,
  notaFinal,
} from "@/lib/nota";
import { obterUsuarioId, salvarResultadoLicao } from "@/lib/progresso";
import { normalizarCenario, type CenarioSimulacao } from "@/lib/simulacao";
import { cenarioParaLicao } from "@/lib/simulacoes-licao";
import { tocarSom } from "@/lib/sons";
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

/** Acertos seguidos que merecem a comemoração "Muito bem!". */
const ACERTOS_PARA_COMEMORAR = 2;

/** Recado fixo da Mimi na abertura da lição (aparece no balão). */
const FALA_INTRO =
  "Oi! Eu sou a Mimi. Vou ficar com você em cada passo. Lembre-se, não há pressa, você pode repetir quantas vezes quiser.";

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
  totalLicoes: number;
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
    "Leia a pergunta e toque na resposta que você acha certa. Depois toque em Continuar. Não tem pressa.",
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
 * Moldura das telas de estado da lição (carregando, bloqueada, erro e sem
 * conteúdo). Segue o mesmo desenho das etapas: barra de status, fundo
 * branco e o X de sair no canto, sem o cabeçalho antigo.
 */
function TelaEstado({
  onFechar,
  children,
}: {
  onFechar: () => void;
  children: ReactNode;
}) {
  const { width: larguraTela } = useWindowDimensions();
  const margem = Math.round(larguraTela * 0.05);
  const ladoX = Math.min(64, Math.round(larguraTela * 0.16));

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: "#FFFFFF" }]}>
      <BarraStatus />

      <View style={[styles.estadoTopo, { paddingHorizontal: margem }]}>
        <TouchableOpacity
          onPress={onFechar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sair da lição"
          style={[
            styles.botaoSairEstado,
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

      <View style={styles.centro}>{children}</View>
    </SafeAreaView>
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
  const [posicaoLicao, setPosicaoLicao] = useState(1);
  const [totalLicoes, setTotalLicoes] = useState(4);
  const [vidas, setVidas] = useState(3);
  const [semVidasVisivel, setSemVidasVisivel] = useState(false);


  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [ajudaVisivel, setAjudaVisivel] = useState(false);
  const [sairVisivel, setSairVisivel] = useState(false);

  // Questionário
  const [indiceQuestao, setIndiceQuestao] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [sequenciaAcertos, setSequenciaAcertos] = useState(0);
  const [comemoracaoVisivel, setComemoracaoVisivel] = useState(false);
  const [notaQuiz, setNotaQuiz] = useState<number | null>(null);

  // Gabarito vindo do servidor (só depois de a pessoa responder)
  const [certaId, setCertaId] = useState<number | null>(null);
  const [acertou, setAcertou] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erroVerificar, setErroVerificar] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [explicacaoCerta, setExplicacaoCerta] = useState("");

  // Simulação
  const [notaSimulacao, setNotaSimulacao] = useState<number | null>(null);
  const [acertosSimulacao, setAcertosSimulacao] = useState(0);
  const [errosSimulacao, setErrosSimulacao] = useState(0);
  const [totalSimulacao, setTotalSimulacao] = useState(0);

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
          if (!usuarioId) return { bloqueada: false, posicao: null, totalLicoes: 4 };

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
            return { bloqueada: false, posicao: null, totalLicoes: 4 };
          }

          const trilha = montarTrilha(
            (respostaNiveis.data ?? []) as unknown as NivelBanco[],
            (respostaProgresso.data ?? []) as ProgressoBanco[]
          );

          const todas = trilha.flatMap((nivel) => nivel.licoes);
          const encontrada = todas.find((item) => item.licoes_id === idLicao);

          return {
            bloqueada: encontrada?.estado === "bloqueada",
            posicao: encontrada?.posicao ?? null,
            totalLicoes: todas.length || 4,
          };
        } catch {
          // Se a checagem falhar, não trava a lição.
          return { bloqueada: false, posicao: null, totalLicoes: 4 };
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

      setLicao(respostaLicao.data);
      setAula(aulaFinal);
      setQuestoes(perguntas);
      setCenario(cenarioFinal);
      setPosicaoLicao(infoBloqueio.posicao ?? 1);
      setTotalLicoes(infoBloqueio.totalLicoes);
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
  const acertouQuestao = verificado && acertou;

  const passosDaIntro = useMemo(() => {
    const lista: string[] = ["Assistir a um vídeo"];
    if (questoes.length > 0) lista.push("Responder algumas perguntas");
    lista.push("Praticar no celular de mentirinha");
    return lista;
  }, [questoes.length]);

  /** O que a Mimi fala em cada etapa. Muda junto com o que está na tela. */
  const falaMimi = useMemo(() => {
    if (etapa === "intro") {
      return FALA_INTRO;
    }

    if (etapa === "video") {
      return "Assista ao vídeo com calma. Se quiser, veja de novo. Quando terminar, toque em Continuar.";
    }

    if (etapa === "questionario") {
      if (!verificado) {
        return "Leia a pergunta e toque na resposta que parece certa. Depois toque em Continuar. Não tem pressa.";
      }

      if (acertouQuestao) {
        return "Isso mesmo! Você acertou. Toque em Continuar para seguir.";
      }

      return "Quase! A resposta certa está marcada em verde. Toque em Continuar e vamos juntos.";
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
    verificado,
    acertouQuestao,
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

  // Audio-descrição: lê a introdução e a pergunta sozinho, mas só quando a
  // pessoa ligou essa opção nas preferências. Sem a opção, a leitura fica
  // por conta dos botões de som de cada tela.
  useEffect(() => {
    if (!audioDescricao) return;
    if (etapa === "intro" && textoOuvir) falar(textoOuvir);
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

  // Ao chegar no resultado, salva uma única vez e toca o som correspondente.
  useEffect(() => {
    if (etapa !== "resultado") return;
    tocarSom(aprovado ? "passou" : "naoPassou");
    if (salvouRef.current) return;
    salvouRef.current = true;
    void salvar();
  }, [etapa, aprovado, salvar]);

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

  function resetarQuiz() {
    setIndiceQuestao(0);
    setSelecionada(null);
    setVerificado(false);
    setAcertos(0);
    setSequenciaAcertos(0);
    setComemoracaoVisivel(false);
    setCertaId(null);
    setAcertou(false);
    setVerificando(false);
    setErroVerificar("");
    setExplicacao("");
    setExplicacaoCerta("");
  }

  function reiniciar(pularVideo: boolean) {
    salvouRef.current = false;
    setSalvo(false);
    setErroSalvar("");
    setXpGanho(0);
    setConquistasNovas([]);
    setNotaQuiz(null);
    setNotaSimulacao(null);
    setAcertosSimulacao(0);
    setErrosSimulacao(0);
    setTotalSimulacao(0);
    setVidas(3);
    setSemVidasVisivel(false);
    resetarQuiz();

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

    const novaSequencia = correta ? sequenciaAcertos + 1 : 0;
    setSequenciaAcertos(novaSequencia);

    setAcertou(correta);
    setCertaId(idCerta);
    setExplicacao(textoExplicacao);
    setExplicacaoCerta(textoExplicacaoCerta);
    setVerificado(true);
    setVerificando(false);

    // Numa sequência, a comemoração aparece por cima da pergunta. O
    // feedback normal continua na própria tela, junto do botão de avançar.
    if (correta && novaSequencia === ACERTOS_PARA_COMEMORAR) {
      setComemoracaoVisivel(true);
    }

    if (correta) {
      tocarSom("acerto");
      setAcertos((total) => total + 1);
    } else {
      tocarSom("erro");
      setVidas((atual) => {
        const proximas = Math.max(0, atual - 1);
        if (proximas === 0) {
          tocarSom("naoPassou");
          setSemVidasVisivel(true);
        }
        return proximas;
      });
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

  /** Um único botão: verifica a resposta antes e avança depois. */
  function continuarQuiz() {
    if (verificado) {
      avancarQuestao();
      return;
    }

    if (selecionada === null) {
      setErroVerificar("Escolha uma resposta para continuar.");
      return;
    }

    void verificarResposta();
  }

  /** Volta para a etapa anterior da lição (normalmente o vídeo). */
  function voltarEtapaAnterior() {
    const posicao = etapasConteudo.indexOf("questionario");
    const anterior = posicao > 0 ? etapasConteudo[posicao - 1] : null;
    if (anterior) setEtapa(anterior);
  }

  /** Volta para a etapa anterior da lição a partir da simulação. */
  function voltarDaSimulacao() {
    const posicao = etapasConteudo.indexOf("simulacao");
    const anterior = posicao > 0 ? etapasConteudo[posicao - 1] : null;
    if (anterior) setEtapa(anterior);
  }

  /** Recomeça o quiz do zero, sem sair da etapa. */
  function recomecarQuiz() {
    pararFala();
    resetarQuiz();
  }

  function aoErrarSimulacao() {
    setVidas((atual) => {
      const proximas = Math.max(0, atual - 1);
      if (proximas === 0) {
        tocarSom("naoPassou");
        setSemVidasVisivel(true);
      }
      return proximas;
    });
  }

  function finalizarSimulacao(erros: number, acertosSim: number, totalPassos: number) {
    setAcertosSimulacao(acertosSim);
    setErrosSimulacao(erros);
    setTotalSimulacao(totalPassos);
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
      <TelaEstado onFechar={sair}>
        <ActivityIndicator size="large" color={tema.roxoEscuro} />
        <Text style={[styles.textoStatus, { color: tema.texto, fontSize: fonte(19) }]}>
          Preparando sua lição...
        </Text>
      </TelaEstado>
    );
  }

  if (bloqueada) {
    return (
      <TelaEstado onFechar={sair}>
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
      </TelaEstado>
    );
  }

  if (erro || !licao || !aula) {
    return (
      <TelaEstado onFechar={sair}>
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
      </TelaEstado>
    );
  }

  // Lição sem nenhum conteúdo ainda: não deixa "concluir" sem aprender nada.
  if (semConteudo) {
    return (
      <TelaEstado onFechar={sair}>
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
      </TelaEstado>
    );
  }

  // ---------- Conteúdo ----------

  // Cada etapa desenha o próprio topo (barra de status e botão de sair da
  // vez), então a tela da lição é sempre branca e não tem cabeçalho comum.
  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: "#FFFFFF" }]}>
      {etapa === "intro" && (
        <IntroLicao
          titulo={conteudo?.titulo?.trim() || tituloLicao}
          descricao={conteudo?.descricao?.trim() || ""}
          fala={FALA_INTRO}
          etapaAtual={posicaoLicao}
          totalEtapas={Math.max(4, totalLicoes)}
          onFechar={pedirParaSair}
          onContinuar={comecar}
        />
      )}

      {etapa === "video" && (
        <VideoLicao
          titulo={conteudo?.titulo?.trim() || "Vídeo da lição"}
          url={conteudo?.url_arquivo ?? null}
          onFechar={pedirParaSair}
          onContinuar={() => irParaProximaEtapa("video")}
        />
      )}

      {etapa === "questionario" && questaoAtual && (
        <QuizLicao
          pergunta={questaoAtual.pergunta}
          alternativas={alternativas.map((alternativa) => ({
            id: alternativa.alternativas_id,
            texto: alternativa.texto,
          }))}
          selecionada={selecionada}
          verificado={verificado}
          certaId={certaId}
          indice={indiceQuestao}
          total={questoes.length}
          verificando={verificando}
          erro={erroVerificar}
          podeVoltar={etapasConteudo.indexOf("questionario") > 0}
          vidas={vidas}
          onSelecionar={(id) => {
            if (verificado || verificando) return;
            setSelecionada(id);
            setErroVerificar("");
            if (audioDescricao) {
              const escolhida = alternativas.find(
                (alternativa) => alternativa.alternativas_id === id
              );
              if (escolhida) falar(escolhida.texto);
            }
          }}
          onContinuar={continuarQuiz}
          onFechar={pedirParaSair}
          onAjuda={() => {
            setAjudaVisivel(true);
            if (audioDescricao) falar(AJUDA_POR_ETAPA.questionario);
          }}
          onOuvir={() => falar(textoOuvir)}
          onVoltar={voltarEtapaAnterior}
          onRecomecar={recomecarQuiz}
        />
      )}

      {etapa === "simulacao" && cenario && (
        <View style={styles.conteudoSimulacao}>
          <SimuladorCelular
            cenario={cenario}
            onFinalizar={finalizarSimulacao}
            onErro={aoErrarSimulacao}
            vidas={vidas}
            onVoltar={voltarDaSimulacao}
            preencher
          />
        </View>
      )}

      {etapa === "resultado" && (
        <ResultadoLicao
          aprovado={aprovado}
          comQuestoes={questoes.length > 0 || totalSimulacao > 0}
          acertos={acertos + acertosSimulacao}
          totalQuestoes={questoes.length + totalSimulacao}
          errosSimulacao={errosSimulacao}
          nota={notaFinalCalculada}
          xp={xpGanho}
          salvando={salvando}
          erro={erroSalvar}
          conquistas={conquistasNovas}
          // Só a lição de demonstração (sem linha no banco) não é salva.
          exemplo={licao?.licoes_id === LICAO_EXEMPLO_ID}
          xpJaGanho={xpGanho === 0 && salvo}
          temVideo={temVideo}
          onContinuar={() => setEtapa("ofensiva")}
          onTentarDeNovo={() => reiniciar(true)}
          onVerVideo={() => reiniciar(false)}
          onSalvarDeNovo={() => void salvar()}
        />
      )}

      {etapa === "ofensiva" && (
        <OfensivaLicao dias={diasSeguidos} onContinuar={irParaTrilha} />
      )}

      {/* Comemoração de sequência: cartão pequeno, só para marcar a sequência */}
      <PopupMuitoBem
        visivel={comemoracaoVisivel}
        sequencia={sequenciaAcertos}
        aoFechar={() => {
          setComemoracaoVisivel(false);
          // Se o pop-up apareceu na última pergunta, já segue para a
          // simulação: sem isso a pessoa precisaria tocar em "Continuar"
          // duas vezes depois de fechar a comemoração.
          if (verificado && indiceQuestao >= questoes.length - 1) {
            avancarQuestao();
          }
        }}
      />

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

      {/* Fim das vidas */}
      <Modal
        visible={semVidasVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => reiniciar(false)}
      >
        <View style={styles.fundoModal}>
          <View
            style={[styles.cartaoAjuda, { backgroundColor: tema.cartao }]}
            accessibilityViewIsModal
          >
            <Text style={[styles.tituloAjuda, { color: tema.texto, fontSize: fonte(24) }]}>
              Suas vidas acabaram!
            </Text>
            <Text style={[styles.textoAjuda, { color: tema.textoSecundario, fontSize: fonte(18) }]}>
              Não se preocupe! Você pode recomeçar a lição com todas as 3 vidas ou voltar para a trilha.
            </Text>
            <BotaoGrande
              titulo="Recomeçar lição"
              onPress={() => reiniciar(false)}
            />
            <BotaoGrande
              titulo="Voltar para a trilha"
              variante="contorno"
              onPress={() => {
                setSemVidasVisivel(false);
                sair();
              }}
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
              variante="perigo"
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
  estadoTopo: {
    paddingTop: 6,
    alignItems: "flex-start",
  },
  botaoSairEstado: {
    backgroundColor: "#E23B2E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  conteudoSimulacao: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 4,
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
  texto: {
    fontFamily: "Poppins_300Light",
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