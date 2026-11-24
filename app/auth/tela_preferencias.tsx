import { router } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { GuiaMimi, useAlvoGuia } from "@/components/GuiaMimi";
import { PageFlow } from "@/components/PageFlow";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "@/lib/primeiro-acesso";

const PASSOS_PREFERENCIAS = [
  "Escolha aqui o tamanho das letras que ficar mais confortável para você ler.",
  "Ative aqui se quiser que eu leia as perguntas e explicações em voz alta.",
  "Quando terminar, toque aqui em Salvar para entrar no aplicativo.",
];

const TAMANHOS = [
  { px: 24, rotulo: "Pequena", letra: 20 },
  { px: 30, rotulo: "Média", letra: 26 },
  { px: 40, rotulo: "Grande", letra: 32 },
];

export default function TelaPreferencias() {
  const insets = useSafeAreaInsets();
  const {
    tema,
    fonte,
    tamanhoFontePx,
    audioDescricao,
    definirAudioDescricao,
    definirTamanhoFonte,
    restaurarPadrao,
    recarregar,
  } = useAcessibilidade();

  // Fonte e áudio mudam e são gravados na hora, pelo hook.
  const [salvando, setSalvando] = useState(false);
  const [guiaAtivo, setGuiaAtivo] = useState(false);
  const [passoGuia, setPassoGuia] = useState(0);

  const refFonte = useRef<View>(null);
  const refAudio = useRef<View>(null);
  const refSalvar = useRef<View>(null);
  const refsGuia = useMemo(() => [refFonte, refAudio, refSalvar], []);
  const { alvo: alvoGuia, remedir: remedirGuia } = useAlvoGuia(guiaAtivo, passoGuia, refsGuia);

  // Quem já tem preferências salvas vê as dela (confirmar ou trocar).
  useEffect(() => {
    void recarregar();
    let ativo = true;
    deveMostrarGuiaTela("preferencias").then((mostrar) => {
      if (ativo && mostrar) setGuiaAtivo(true);
    });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fundo = "#FFFFFF";
  const borda = "#D9A8F7";
  const texto = tema.texto;
  const secundario = tema.textoSecundario;

  const proximoTamanho = () => {
    const idx = TAMANHOS.findIndex((t) => t.px === tamanhoFontePx);
    const proximo = TAMANHOS[(idx + 1) % TAMANHOS.length];
    void definirTamanhoFonte(proximo.px);
  };

  async function salvarPreferencias() {
    if (salvando) return;
    setSalvando(true);

    // O hook grava as três preferências de uma vez (tema, fonte e áudio).
    // Isso também cria a linha de quem nunca mexeu em nada e vai com os padrões.
    await definirTamanhoFonte(tamanhoFontePx);

    setSalvando(false);
    router.replace("/onboarding/bem_vindo");
  }

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <TouchableOpacity
        style={[styles.botaoVoltarTopo, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft size={26} color="#303030" strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={remedirGuia}
        onMomentumScrollEnd={remedirGuia}
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: 68, paddingBottom: 96 + insets.bottom },
        ]}
      >
        <Text style={[styles.tituloPrincipal, { color: "#303030", fontSize: fonte(32) }]}>
          Preferências
        </Text>

        {/* Áudio-descrição (Sem Modo Escuro) */}
        <View
          ref={refAudio}
          collapsable={false}
          style={[styles.cartao, { backgroundColor: tema.cartao, borderColor: borda }]}
        >
          <View style={styles.linhaTituloSwitch}>
            <View style={styles.textoAudio}>
              <Text style={[styles.titulo, { color: texto, fontSize: fonte(19) }]}>
                Áudio Descrição
              </Text>
            </View>
            <Switch
              value={audioDescricao}
              onValueChange={(valor) => void definirAudioDescricao(valor)}
              trackColor={{ false: "#D8D2DC", true: "#FFE169" }}
              thumbColor="#303030"
              accessibilityLabel="Ativar áudio descrição"
            />
          </View>
        </View>

        {/* Tamanho da Fonte */}
        <View
          ref={refFonte}
          collapsable={false}
          style={[styles.cartao, { backgroundColor: tema.cartao, borderColor: borda }]}
        >
          <Text style={[styles.tituloCentro, { color: texto, fontSize: fonte(20) }]}>
            Tamanho da Fonte
          </Text>

          <View style={styles.linhaTamanhos}>
            {TAMANHOS.map((tamanho) => {
              const ativo = tamanhoFontePx === tamanho.px;
              return (
                <Pressable
                  key={tamanho.px}
                  style={[
                    styles.botaoTamanho,
                    {
                      backgroundColor: ativo ? "#D689FF" : "#FFFFFF",
                      borderColor: ativo ? "#C77DFF" : "#EFE6F7",
                    },
                  ]}
                  onPress={() => void definirTamanhoFonte(tamanho.px)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={`Tamanho ${tamanho.rotulo}, ${tamanho.px} pixels`}
                >
                  <Text
                    style={[
                      styles.letraTamanho,
                      { color: "#303030", fontSize: tamanho.letra },
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    style={[
                      styles.rotuloTamanho,
                      { color: ativo ? "#2C1038" : secundario, fontSize: fonte(12) },
                    ]}
                  >
                    {tamanho.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.dropdownPx, { borderColor: "#EFE6F7" }]}
            onPress={proximoTamanho}
            accessibilityRole="button"
            accessibilityLabel={`Tamanho atual ${tamanhoFontePx} pixels. Toque para alternar.`}
          >
            <Text style={[styles.rotuloPx, { color: texto, fontSize: fonte(15) }]}>
              {tamanhoFontePx}px.
            </Text>
            <ChevronRight size={20} color="#303030" strokeWidth={2.4} />
          </Pressable>
        </View>

        <View ref={refSalvar} collapsable={false}>
          <Pressable
            style={({ pressed }) => [
              styles.botaoSalvar,
              { opacity: salvando ? 0.6 : pressed ? 0.85 : 1 },
            ]}
            onPress={salvarPreferencias}
            disabled={salvando}
            accessibilityRole="button"
            accessibilityLabel="Salvar preferências"
          >
            <Text style={[styles.textoSalvar, { fontSize: fonte(26) }]}>
              {salvando ? "Salvando..." : "Salvar"}
            </Text>
          </Pressable>
        </View>

      </ScrollView>

      <PageFlow total={4} currentIndex={2} />

      <GuiaMimi
        visivel={guiaAtivo}
        alvo={alvoGuia}
        texto={PASSOS_PREFERENCIAS[passoGuia]}
        passoAtual={passoGuia + 1}
        totalPassos={PASSOS_PREFERENCIAS.length}
        textoBotaoPrincipal={
          passoGuia === PASSOS_PREFERENCIAS.length - 1 ? "Entendi" : "Próximo"
        }
        aoPressionarPrincipal={() => {
          if (passoGuia < PASSOS_PREFERENCIAS.length - 1) {
            setPassoGuia((p) => p + 1);
          } else {
            setGuiaAtivo(false);
          }
        }}
        aoPressionarSecundario={() => {
          setGuiaAtivo(false);
          void concluirFluxoEssencial();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  botaoVoltarTopo: {
    position: "absolute",
    left: 20,
    zIndex: 5,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5B4FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 5,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  tituloPrincipal: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginBottom: 8,
  },
  cartao: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  linhaTituloSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  titulo: {
    fontFamily: "Poppins_600SemiBold",
    flexShrink: 1,
  },
  tituloCentro: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
  },
  textoAudio: {
    flex: 1,
  },
  ajudaAudio: {
    fontFamily: "Poppins_300Light",
    marginTop: 2,
  },
  linhaTamanhos: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  botaoTamanho: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    shadowColor: "#C77DFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  letraTamanho: {
    fontFamily: "Poppins_800ExtraBold",
  },
  rotuloTamanho: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 2,
  },
  dropdownPx: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  rotuloPx: {
    fontFamily: "Poppins_600SemiBold",
  },
  seloPx: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  textoPx: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#2C1038",
  },
  botaoReset: {
    marginTop: 18,
    minHeight: 56,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  textoReset: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    flexShrink: 1,
    textAlign: "center",
  },
  erro: {
    color: "#C04B4B",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 16,
  },
  botaoSalvar: {
    backgroundColor: "#D689FF",
    marginTop: 24,
    alignSelf: "center",
    width: "100%",
    borderRadius: 20,
    paddingVertical: 18,
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  textoSalvar: {
    textAlign: "center",
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
});