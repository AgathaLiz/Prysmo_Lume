import { router } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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

  const fundo = "#E9B8FF";
  const borda = "#DFC3F5";
  const texto = tema.texto;
  const secundario = tema.textoSecundario;

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={remedirGuia}
        onMomentumScrollEnd={remedirGuia}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 24 + insets.bottom },
        ]}
      >
        <Text style={[styles.tituloPrincipal, { color: "#303030", fontSize: fonte(32) }]}>
          Preferências
        </Text>

        {/* Fonte */}
        <View
          ref={refFonte}
          collapsable={false}
          style={[styles.cartao, { backgroundColor: tema.cartao, borderColor: borda }]}
        >
          <Text style={[styles.titulo, { color: texto, fontSize: fonte(22) }]}>Fonte</Text>

          <View style={styles.linhaTamanhos}>
            {TAMANHOS.map((tamanho) => {
              const ativo = tamanhoFontePx === tamanho.px;
              return (
                <Pressable
                  key={tamanho.px}
                  style={[
                    styles.botaoTamanho,
                    {
                      backgroundColor: ativo ? tema.roxo : "#F3ECF8",
                      borderColor: ativo ? tema.roxoEscuro : "transparent",
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
                      { color: ativo ? "#2C1038" : texto, fontSize: tamanho.letra },
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    style={[
                      styles.rotuloTamanho,
                      { color: ativo ? "#2C1038" : secundario, fontSize: fonte(11) },
                    ]}
                  >
                    {tamanho.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.linhaPx, { borderTopColor: tema.borda }]}>
            <Text style={[styles.rotuloPx, { color: texto, fontSize: fonte(16) }]}>
              Tamanho atual
            </Text>
            <View style={[styles.seloPx, { backgroundColor: tema.roxo }]}>
              <Text style={[styles.textoPx, { fontSize: fonte(14) }]}>
                {tamanhoFontePx} px
              </Text>
            </View>
          </View>
        </View>

        {/* Áudio-descrição */}
        <View
          ref={refAudio}
          collapsable={false}
          style={[styles.cartao, { backgroundColor: tema.cartao, borderColor: borda }]}
        >
          <View style={styles.linhaTituloSwitch}>
            <View style={styles.textoAudio}>
              <Text style={[styles.titulo, { color: texto, fontSize: fonte(22) }]}>
                Áudio descrição
              </Text>
              <Text style={[styles.ajudaAudio, { color: secundario, fontSize: fonte(13) }]}>
                O app lê as perguntas e os resultados em voz alta
              </Text>
            </View>
            <Switch
              value={audioDescricao}
              onValueChange={(valor) => void definirAudioDescricao(valor)}
              trackColor={{ false: "#D8D2DC", true: tema.roxoEscuro }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Ativar áudio descrição"
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botaoReset,
            { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
          ]}
          onPress={() => void restaurarPadrao()}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao padrão"
        >
          <RotateCcw size={22} color="#303030" strokeWidth={2.3} />
          <Text style={[styles.textoReset, { fontSize: fonte(18) }]}>
            Redefinir
          </Text>
        </Pressable>

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

        <PageFlow total={4} currentIndex={2} inline />
      </ScrollView>

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
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  tituloPrincipal: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginBottom: 6,
  },
  cartao: {
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 3,
    padding: 20,
  },
  linhaTituloSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    flexShrink: 1,
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
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  letraTamanho: {
    fontFamily: "Poppins_800ExtraBold",
  },
  rotuloTamanho: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 2,
  },
  linhaPx: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 14,
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
    backgroundColor: "#FFD651",
    marginTop: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  textoSalvar: {
    textAlign: "center",
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
});