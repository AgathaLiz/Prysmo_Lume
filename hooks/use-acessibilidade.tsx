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

import { TemaClaro, TemaEscuro, type Tema } from "@/constants/cores";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";

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
  tema: Tema;
  /** Multiplica o tamanho de fonte base, arredondando. */
  fonte: (tamanhoBase: number) => number;
  falar: (texto?: string | null) => void;
  pararFala: () => void;
  recarregar: () => Promise<void>;
  definirModoEscuro: (valor: boolean) => Promise<void>;
  definirTamanhoFonte: (pixels: number) => Promise<void>;
  definirAudioDescricao: (valor: boolean) => Promise<void>;
  restaurarPadrao: () => Promise<void>;
};

const ContextoAcessibilidade = createContext<Contexto | null>(null);

function escalaDe(pixels: number | null): number {
  if (!pixels || pixels <= 0) return ESCALA_PEQUENA;
  if (pixels <= 24) return ESCALA_PEQUENA;
  if (pixels >= 40) return ESCALA_GRANDE;
  return ESCALA_MEDIA;
}

export function AcessibilidadeProvider({ children }: { children: ReactNode }) {
  const esquemaDoSistema = useColorScheme();

  // null = sem preferência salva -> segue o sistema.
  const [modoEscuroSalvo, setModoEscuroSalvo] = useState<boolean | null>(null);
  const [escalaFonte, setEscalaFonte] = useState(ESCALA_PEQUENA);
  const [tamanhoFontePx, setTamanhoFontePx] = useState(24);
  const [audioDescricao, setAudioDescricao] = useState(false);
  const [reduzirMovimento, setReduzirMovimento] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const primeiraCarga = useRef(true);

  const recarregar = useCallback(async () => {
    try {
      const { data: sessao } = await supabase.auth.getSession();
      const idAuth = sessao.session?.user.id;

      if (!idAuth) {
        setModoEscuroSalvo(null);
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
        setModoEscuroSalvo(null);
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
      setModoEscuroSalvo(data.modo_escuro ?? null);
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
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimento);
    const inscricao = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduzirMovimento
    );
    return () => inscricao.remove();
  }, []);

  const falar = useCallback((texto?: string | null) => {
    if (!texto) return;
    Speech.stop();
    // Um pouco mais devagar, pensando em quem tem dificuldade de acompanhar.
    Speech.speak(texto, { language: "pt-BR", rate: 0.9 });
  }, []);

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
              modo_escuro:
                parcial.modo_escuro ??
                modoEscuroSalvo ??
                (esquemaDoSistema === "dark"),
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
    [
      audioDescricao,
      esquemaDoSistema,
      modoEscuroSalvo,
      tamanhoFontePx,
    ]
  );

  const definirModoEscuro = useCallback(
    async (valor: boolean) => {
      setModoEscuroSalvo(valor);
      await salvarConfiguracoes({ modo_escuro: valor });
    },
    [salvarConfiguracoes]
  );

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

  const restaurarPadrao = useCallback(async () => {
    setModoEscuroSalvo(false);
    setTamanhoFontePx(24);
    setEscalaFonte(ESCALA_PEQUENA);
    setAudioDescricao(false);
    await salvarConfiguracoes({
      modo_escuro: false,
      tamanho_fonte: 24,
      audio_descricao: false,
    });
  }, [salvarConfiguracoes]);

  const modoEscuro = false;

  const valor = useMemo<Contexto>(
    () => ({
      carregando,
      escalaFonte,
      tamanhoFontePx,
      modoEscuro,
      audioDescricao,
      reduzirMovimento,
      tema: modoEscuro ? TemaEscuro : TemaClaro,
      fonte: (tamanhoBase: number) => Math.round(tamanhoBase * escalaFonte),
      falar,
      pararFala,
      recarregar,
      definirModoEscuro,
      definirTamanhoFonte,
      definirAudioDescricao,
      restaurarPadrao,
    }),
    [
      carregando,
      escalaFonte,
      tamanhoFontePx,
      modoEscuro,
      audioDescricao,
      reduzirMovimento,
      falar,
      pararFala,
      recarregar,
      definirModoEscuro,
      definirTamanhoFonte,
      definirAudioDescricao,
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
    tema: TemaClaro,
    fonte: (tamanhoBase: number) => tamanhoBase,
    falar: () => {},
    pararFala: () => {},
    recarregar: async () => {},
    definirModoEscuro: async () => {},
    definirTamanhoFonte: async () => {},
    definirAudioDescricao: async () => {},
    restaurarPadrao: async () => {},
  };
}
