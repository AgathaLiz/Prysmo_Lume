/**
 * Cores do Lume.
 *
 * Estes valores são os mesmos já usados nas telas existentes
 * (cadastro, login, preferências, onboarding). Não são um tema novo:
 * é só a paleta do app com nome, para as telas novas não saírem do tom.
 */

export type Tema = {
  fundo: string;
  cartao: string;
  cartaoSuave: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  roxo: string;
  roxoEscuro: string;
  amarelo: string;
  amareloSuave: string;
  destaque: string;
  sucesso: string;
  sucessoFundo: string;
  erro: string;
  erroFundo: string;
  bloqueado: string;
};

export const TemaClaro: Tema = {
  fundo: "#E9B8FF",
  cartao: "#FFFFFF",
  cartaoSuave: "#F6F2F8",
  texto: "#303030",
  textoSecundario: "#8A8080",
  borda: "#D9D9D9",
  roxo: "#D987FF",
  roxoEscuro: "#891CC0",
  amarelo: "#FFD651",
  amareloSuave: "#FFE169",
  destaque: "#FFC629",
  sucesso: "#1E6B34",
  sucessoFundo: "#DFF5E1",
  erro: "#C04B4B",
  erroFundo: "#FBE4E4",
  bloqueado: "#D9D9D9",
};

export const TemaEscuro: Tema = {
  fundo: "#1C1720",
  cartao: "#2B2430",
  cartaoSuave: "#332B3A",
  texto: "#F7F3F9",
  textoSecundario: "#C9C0D0",
  borda: "#5A4C63",
  roxo: "#D987FF",
  roxoEscuro: "#B36BE0",
  amarelo: "#FFD651",
  amareloSuave: "#FFE169",
  destaque: "#FFC629",
  sucesso: "#7ED99A",
  sucessoFundo: "#1F3A28",
  erro: "#FF9E9E",
  erroFundo: "#3D2226",
  bloqueado: "#4A3F52",
};

/** Medidas que ajudam a manter o mesmo espaçamento em todas as telas novas. */
export const Medidas = {
  /** Alvo de toque mínimo recomendado (56 x 56). */
  toque: 56,
  raioCartao: 20,
  raioBotao: 22,
  espaco: 16,
  espacoGrande: 24,
};

/**
 * Cores próprias da trilha "galáxia".
 *
 * O fundo roxo escuro é proposital: as estrelas amarelas precisam brilhar.
 * Os textos são claros em qualquer tema, por isso não usamos `Tema` aqui.
 */
export const TrilhaCores = {
  gradienteTopo: "#3B0A57",
  gradienteMeio: "#5A1180",
  gradienteFundo: "#25063A",
  gradienteTopoEscuro: "#17041F",
  gradienteMeioEscuro: "#2A073D",
  gradienteFundoEscuro: "#120317",
  texto: "#FFFFFF",
  textoSecundario: "#E7D6F0",
  caminho: "#FFD8E8",
  caminhoSuave: "rgba(255, 216, 232, 0.22)",
  estrela: "#FFD651",
  estrelaBorda: "#D99A00",
  estrelaBrilho: "#FFE9A3",
  estrelaBloqueada: "#6D4C7F",
  estrelaBloqueadaBorda: "#4A3159",
  cartao: "rgba(255, 255, 255, 0.12)",
  cartaoForte: "rgba(255, 255, 255, 0.2)",
  borda: "rgba(255, 255, 255, 0.24)",
  abaAtiva: "#FFD651",
  abaInativa: "rgba(255, 255, 255, 0.12)",
  textoAbaAtiva: "#32064F",
  navFundo: "#FFFFFF",
  navAtivo: "#891CC0",
  navInativo: "#8A8080",
} as const;
