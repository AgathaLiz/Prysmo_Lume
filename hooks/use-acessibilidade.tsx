/**
 * Acessibilidade do Lume.
 *
 * Lê `usuario_acessibilidade_settings` (tamanho_fonte em px, modo_escuro,
 * audio_descricao) e entrega para as telas:
 * - escalaFonte / fonte(): textos grandes, nunca menores que a base;
 * - tema: claro ou escuro;
 * - audioDescricao + falar(): expo-speech em pt-BR;
 * - reduzirMovimento: respeita a opção do sistema.
 *
 * Se não houver sessão ou linha salva, usa os padrões seguros
 * (1x, modo do sistema, áudio desligado) e o app continua funcionando.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo } from "react-native";
import * as Speech from "expo-speech";

import { TemaClaro, type Tema } from "@/constants/cores";
import { supabase } from "@/lib/supabase";

const CHAVE_EXTRAS = "lume_acessibilidade_extras_v1";

export type ModoDaltonismo =
  | "nenhum"
  | "alto_contraste"
  | "deuteranopia"
  | "tritanopia";

export type VelocidadeAudio = 0.75 | 0.9 | 1.15;

type ExtrasLocais = {
  pararAnimacoes: boolean;
  daltonismo: ModoDaltonismo;
  velocidadeAudio: VelocidadeAudio;
  legendas: boolean;
  libras: boolean;
  negrito: boolean;
};

const EXTRAS_PADRAO: ExtrasLocais = {
  pararAnimacoes: false,
  daltonismo: "nenhum",
  velocidadeAudio: 0.9,
  legendas: false,
  libras: false,
  negrito: false,
};

// O banco guarda px (24 / 30 / 40). Convertemos para escala,
// sem nunca diminuir o texto base (importante para baixa visão):
// "Pequena" é o próprio texto desenhado no protótipo (1x),
// "Média" cresce um pouco e "Grande" cresce mais.
const ESCALA_PEQUENA = 1;
const ESCALA_MEDIA = 1.15;
const ESCALA_GRANDE = 1.35;

type ConfiguracoesBanco = {
  tamanho_fonte: number | null;
  modo_escuro: boolean | null;
  audio_descricao: boolean | null;
};

type Contexto = {
  carregando: boolean;
  escalaFonte: number;
  tamanhoFontePx: number;
  modoEscuro: boolean;
  audioDescricao: boolean;
  reduzirMovimento: boolean;
  pararAnimacoes: boolean;
  daltonismo: ModoDaltonismo;
  velocidadeAudio: VelocidadeAudio;
  legendas: boolean;
  libras: boolean;
  negrito: boolean;
  tema: Tema;
  /** Multiplica o tamanho de fonte base, arredondando. */
  fonte: (tamanhoBase: number) => number;
  falar: (texto?: string | null) => void;
  pararFala: () => void;
  recarregar: () => Promise<void>;
  definirModoEscuro: (valor: boolean) => Promise<void>;
  definirTamanhoFonte: (pixels: number) => Promise<void>;
  definirAudioDescricao: (valor: boolean) => Promise<void>;
  definirPararAnimacoes: (valor: boolean) => Promise<void>;
  definirDaltonismo: (modo: ModoDaltonismo) => Promise<void>;
  definirVelocidadeAudio: (velocidade: VelocidadeAudio) => Promise<void>;
  definirLegendas: (valor: boolean) => Promise<void>;
  definirLibras: (valor: boolean) => Promise<void>;
  definirNegrito: (valor: boolean) => Promise<void>;
  restaurarPadrao: () => Promise<void>;
};

const ContextoAcessibilidade = createContext<Contexto | null>(null);

function temaAdaptado(daltonismo: ModoDaltonismo): Tema {
  if (daltonismo === "alto_contraste") {
    return {
      ...TemaClaro,
      texto: "#12081C",
      textoSecundario: "#2E2236",
      borda: "#303030",
      roxoEscuro: "#4A0A70",
      sucesso: "#1B5E20",
      erro: "#B71C1C",
    };
  }
  if (daltonismo === "deuteranopia") {
    return {
      ...TemaClaro,
      sucesso: "#1D6FD8",
      erro: "#D97706",
      destaque: "#0284C7",
    };
  }
  if (daltonismo === "tritanopia") {
    return {
      ...TemaClaro,
      sucesso: "#0F766E",
      erro: "#BE123C",
      roxoEscuro: "#7E22CE",
    };
  }
  return TemaClaro;
}

function escalaDe(pixels: number | null): number {
  if (!pixels || pixels <= 0) return ESCALA_PEQUENA;
  if (pixels <= 24) return ESCALA_PEQUENA;
  if (pixels >= 40) return ESCALA_GRANDE;
  return ESCALA_MEDIA;
}

export function AcessibilidadeProvider({ children }: { children: ReactNode }) {
  const [escalaFonte, setEscalaFonte] = useState(ESCALA_PEQUENA);
  const [tamanhoFontePx, setTamanhoFontePx] = useState(24);
  const [audioDescricao, setAudioDescricao] = useState(false);
  const [reduzirMovimentoSistema, setReduzirMovimentoSistema] = useState(false);
  const [extras, setExtras] = useState<ExtrasLocais>(EXTRAS_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const primeiraCarga = useRef(true);

  const salvarExtras = useCallback(async (parcial: Partial<ExtrasLocais>) => {
    setExtras((atual) => {
      const proximo = { ...atual, ...parcial };
      AsyncStorage.setItem(CHAVE_EXTRAS, JSON.stringify(proximo)).catch(() => {});
      return proximo;
    });
  }, []);

  const recarregar = useCallback(async () => {
    try {
      const salvoLocal = await AsyncStorage.getItem(CHAVE_EXTRAS);
      if (salvoLocal) {
        const parsed = JSON.parse(salvoLocal) as Partial<ExtrasLocais>;
        setExtras({ ...EXTRAS_PADRAO, ...parsed });
      }

      const { data: sessao } = await supabase.auth.getSession();
      const idAuth = sessao.session?.user.id;

      if (!idAuth) {
        setEscalaFonte(ESCALA_PEQUENA);
        setTamanhoFontePx(24);
        setAudioDescricao(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuario")
        .select("usuario_id")
        .eq("auth_user_id", idAuth)
        .maybeSingle<{ usuario_id: number }>();

      if (!usuario) {
        setEscalaFonte(ESCALA_PEQUENA);
        setTamanhoFontePx(24);
        setAudioDescricao(false);
        return;
      }

      const { data } = await supabase
        .from("usuario_acessibilidade_settings")
        .select("tamanho_fonte, modo_escuro, audio_descricao")
        .eq("usuario_id", usuario.usuario_id)
        .maybeSingle<ConfiguracoesBanco>();

      if (!data) return;

      setEscalaFonte(escalaDe(data.tamanho_fonte));
      setTamanhoFontePx(data.tamanho_fonte ?? 24);
      setAudioDescricao(data.audio_descricao ?? false);
    } catch (erro) {
      // Sem internet? Fica no padrão e o app segue.
      console.log("Erro ao carregar acessibilidade:", erro);
    } finally {
      if (primeiraCarga.current) {
        primeiraCarga.current = false;
        setCarregando(false);
      }
    }
  }, []);

  // Carrega agora e de novo quando a pessoa entra ou sai da conta.
  useEffect(() => {
    recarregar();

    const { data: inscricao } = supabase.auth.onAuthStateChange(() => {
      // Fora do callback para não travar o cliente do Supabase.
      setTimeout(() => {
        recarregar();
      }, 0);
    });

    return () => inscricao.subscription.unsubscribe();
  }, [recarregar]);

  // Respeita "reduzir movimento" do sistema.
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimentoSistema);
    const inscricao = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduzirMovimentoSistema
    );
    return () => inscricao.remove();
  }, []);

  const falar = useCallback(
    (texto?: string | null, velocidadeOverride?: VelocidadeAudio) => {
      if (!texto) return;
      Speech.stop();
      Speech.speak(texto, {
        language: "pt-BR",
        rate: velocidadeOverride ?? extras.velocidadeAudio,
      });
    },
    [extras.velocidadeAudio]
  );

  const pararFala = useCallback(() => {
    Speech.stop();
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const salvarConfiguracoes = useCallback(
    async (parcial: Partial<ConfiguracoesBanco>) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: usuario } = await supabase
          .from("usuario")
          .select("usuario_id")
          .eq("auth_user_id", user.id)
          .maybeSingle<{ usuario_id: number }>();

        if (!usuario) return;

        const { error } = await supabase
          .from("usuario_acessibilidade_settings")
          .upsert(
            {
              usuario_id: usuario.usuario_id,
              tamanho_fonte: parcial.tamanho_fonte ?? tamanhoFontePx,
              modo_escuro: false,
              audio_descricao: parcial.audio_descricao ?? audioDescricao,
            },
            { onConflict: "usuario_id" }
          );

        if (error) {
          console.log("Erro ao salvar acessibilidade:", error.message);
        }
      } catch (erro) {
        console.log("Erro ao salvar acessibilidade:", erro);
      }
    },
    [audioDescricao, tamanhoFontePx]
  );

  const definirModoEscuro = useCallback(async () => {}, []);

  const definirTamanhoFonte = useCallback(
    async (pixels: number) => {
      setTamanhoFontePx(pixels);
      setEscalaFonte(escalaDe(pixels));
      await salvarConfiguracoes({ tamanho_fonte: pixels });
    },
    [salvarConfiguracoes]
  );

  const definirAudioDescricao = useCallback(
    async (valor: boolean) => {
      setAudioDescricao(valor);
      await salvarConfiguracoes({ audio_descricao: valor });
    },
    [salvarConfiguracoes]
  );

  const definirPararAnimacoes = useCallback(
    async (valor: boolean) => {
      await salvarExtras({ pararAnimacoes: valor });
    },
    [salvarExtras]
  );

  const definirDaltonismo = useCallback(
    async (daltonismo: ModoDaltonismo) => {
      await salvarExtras({ daltonismo });
    },
    [salvarExtras]
  );

  const definirVelocidadeAudio = useCallback(
    async (velocidadeAudio: VelocidadeAudio) => {
      await salvarExtras({ velocidadeAudio });
    },
    [salvarExtras]
  );

  const definirLegendas = useCallback(
    async (legendas: boolean) => {
      await salvarExtras({ legendas });
    },
    [salvarExtras]
  );

  const definirLibras = useCallback(
    async (libras: boolean) => {
      await salvarExtras({ libras });
    },
    [salvarExtras]
  );

  const definirNegrito = useCallback(
    async (negrito: boolean) => {
      await salvarExtras({ negrito });
    },
    [salvarExtras]
  );

  const restaurarPadrao = useCallback(async () => {
    setTamanhoFontePx(24);
    setEscalaFonte(ESCALA_PEQUENA);
    setAudioDescricao(false);
    setExtras(EXTRAS_PADRAO);
    AsyncStorage.setItem(CHAVE_EXTRAS, JSON.stringify(EXTRAS_PADRAO)).catch(
      () => {}
    );
    await salvarConfiguracoes({
      modo_escuro: false,
      tamanho_fonte: 24,
      audio_descricao: false,
    });
  }, [salvarConfiguracoes]);

  const modoEscuro = false;
  const reduzirMovimento = reduzirMovimentoSistema || extras.pararAnimacoes;
  const tema = useMemo(() => temaAdaptado(extras.daltonismo), [extras.daltonismo]);

  const valor = useMemo<Contexto>(
    () => ({
      carregando,
      escalaFonte,
      tamanhoFontePx,
      modoEscuro,
      audioDescricao,
      reduzirMovimento,
      pararAnimacoes: extras.pararAnimacoes,
      daltonismo: extras.daltonismo,
      velocidadeAudio: extras.velocidadeAudio,
      legendas: extras.legendas,
      libras: extras.libras,
      negrito: extras.negrito,
      tema,
      fonte: (tamanhoBase: number) => Math.round(tamanhoBase * escalaFonte),
      falar,
      pararFala,
      recarregar,
      definirModoEscuro,
      definirTamanhoFonte,
      definirAudioDescricao,
      definirPararAnimacoes,
      definirDaltonismo,
      definirVelocidadeAudio,
      definirLegendas,
      definirLibras,
      definirNegrito,
      restaurarPadrao,
    }),
    [
      carregando,
      escalaFonte,
      tamanhoFontePx,
      modoEscuro,
      audioDescricao,
      reduzirMovimento,
      extras,
      tema,
      falar,
      pararFala,
      recarregar,
      definirModoEscuro,
      definirTamanhoFonte,
      definirAudioDescricao,
      definirPararAnimacoes,
      definirDaltonismo,
      definirVelocidadeAudio,
      definirLegendas,
      definirLibras,
      definirNegrito,
      restaurarPadrao,
    ]
  );

  return (
    <ContextoAcessibilidade.Provider value={valor}>
      {children}
    </ContextoAcessibilidade.Provider>
  );
}

/**
 * Se alguma tela nova for usada fora do provider (ex.: um teste isolado),
 * devolvemos os padrões em vez de quebrar.
 */
export function useAcessibilidade(): Contexto {
  const contexto = useContext(ContextoAcessibilidade);
  if (contexto) return contexto;

  return {
    carregando: false,
    escalaFonte: ESCALA_PEQUENA,
    tamanhoFontePx: 24,
    modoEscuro: false,
    audioDescricao: false,
    reduzirMovimento: false,
    pararAnimacoes: false,
    daltonismo: "nenhum",
    velocidadeAudio: 0.9,
    legendas: false,
    libras: false,
    negrito: false,
    tema: TemaClaro,
    fonte: (tamanhoBase: number) => tamanhoBase,
    falar: () => {},
    pararFala: () => {},
    recarregar: async () => {},
    definirModoEscuro: async () => {},
    definirTamanhoFonte: async () => {},
    definirAudioDescricao: async () => {},
    definirPararAnimacoes: async () => {},
    definirDaltonismo: async () => {},
    definirVelocidadeAudio: async () => {},
    definirLegendas: async () => {},
    definirLibras: async () => {},
    definirNegrito: async () => {},
    restaurarPadrao: async () => {},
  };
}
