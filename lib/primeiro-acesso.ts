import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_ESSENCIAL_CONCLUIDO = "lume_guia_essencial_concluido_v1";
const CHAVE_TOUR_APP = "lume_guia_tour_app_v1";
const PREFIXO_TELA_VISTA = "lume_guia_tela_v1_";

export type EstadoTourApp = "pendente" | "oferecer" | "concluido";
export type TelaGuia =
  | "contas"
  | "cadastro"
  | "login"
  | "preferencias"
  | "inicio_essencial"
  | "trilha";

/**
 * Diz se o guia da Mimi deve abrir nesta tela (apenas no primeiro acesso e
 * apenas na primeira vez que a pessoa entra nela — se voltar depois, não
 * repete).
 */
export async function deveMostrarGuiaTela(tela: TelaGuia): Promise<boolean> {
  try {
    const primeiro = await ehPrimeiroAcesso();
    if (!primeiro) return false;

    const chave = `${PREFIXO_TELA_VISTA}${tela}`;
    const jaViu = await AsyncStorage.getItem(chave);
    if (jaViu === "1") return false;

    await AsyncStorage.setItem(chave, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Diz se o usuário ainda está no primeiro acesso (fluxo essencial:
 * cadastro/login -> preferências -> início -> trilha -> primeira lição).
 */
export async function ehPrimeiroAcesso(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_ESSENCIAL_CONCLUIDO);
    return valor !== "1";
  } catch {
    return false;
  }
}

/**
 * Marca que o fluxo essencial foi concluído (ou pulado) e, caso o tour
 * completo do app ainda esteja pendente, agenda a oferta dele para a próxima
 * vez que o usuário estiver na tela inicial.
 */
export async function concluirFluxoEssencial(): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_ESSENCIAL_CONCLUIDO, "1");
    const tourAtual = await AsyncStorage.getItem(CHAVE_TOUR_APP);
    if (!tourAtual) {
      await AsyncStorage.setItem(CHAVE_TOUR_APP, "oferecer");
    }
  } catch {
    // Sem bloqueio se o armazenamento falhar.
  }
}

export async function obterEstadoTourApp(): Promise<EstadoTourApp> {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_TOUR_APP);
    if (valor === "oferecer" || valor === "concluido") return valor;
    return "pendente";
  } catch {
    return "concluido";
  }
}

export async function definirEstadoTourApp(estado: EstadoTourApp): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_TOUR_APP, estado);
  } catch {
    // Sem bloqueio se o armazenamento falhar.
  }
}
