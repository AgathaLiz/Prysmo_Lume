import { RotateCcw } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const TAMANHOS = [
  { px: 24, rotulo: "Pequena", letra: 20 },
  { px: 30, rotulo: "Média", letra: 26 },
  { px: 40, rotulo: "Grande", letra: 32 },
];

export default function TelaAparencia() {
  const insets = useSafeAreaInsets();
  const {
    tema,
    fonte,
    tamanhoFontePx,
    negrito,
    definirTamanhoFonte,
    definirNegrito,
    restaurarPadrao,
  } = useAcessibilidade();

  const fundo = "#F8F4FC";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const borda = "#DFC3F5";
  const familiaPreview = negrito ? "Poppins_800ExtraBold" : "Poppins_600SemiBold";

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <BotaoVoltar />

        <View style={[styles.cartao, { backgroundColor: cartao, borderColor: borda }]}>
          <Text style={[styles.titulo, { color: texto, fontSize: fonte(22) }]}>Fonte</Text>

          <View style={styles.linhaNegrito}>
            <View style={styles.textoNegrito}>
              <Text
                style={[
                  styles.tituloNegrito,
                  { color: texto, fontSize: fonte(17), fontFamily: familiaPreview },
                ]}
              >
                Negrito
              </Text>
              <Text style={[styles.ajudaNegrito, { color: secundario, fontSize: fonte(13) }]}>
                Deixa os textos mais fortes
              </Text>
            </View>
            <Switch
              value={negrito}
              onValueChange={(valor) => void definirNegrito(valor)}
              trackColor={{ false: "#D8D2DC", true: tema.roxoEscuro }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Ativar texto em negrito"
            />
          </View>

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
                      {
                        color: ativo ? "#2C1038" : texto,
                        fontSize: tamanho.letra,
                      },
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

        <Pressable
          style={({ pressed }) => [
            styles.botaoReset,
            { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
          ]}
          onPress={() => {
            void restaurarPadrao();
          }}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao padrão"
        >
          <RotateCcw size={22} color="#303030" strokeWidth={2.3} />
          <Text style={[styles.textoReset, { fontSize: fonte(18) }]}>
            Voltar ao Padrão
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  cartao: {
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 3,
    padding: 20,
  },
  titulo: {
    fontFamily: "Poppins_900Black",
    flexShrink: 1,
  },
  linhaNegrito: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },
  textoNegrito: {
    flex: 1,
  },
  tituloNegrito: {
    fontFamily: "Poppins_600SemiBold",
  },
  ajudaNegrito: {
    fontFamily: "Poppins_300Light",
    marginTop: 1,
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
    fontFamily: "Poppins_900Black",
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
    fontFamily: "Poppins_900Black",
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
    fontFamily: "Poppins_900Black",
    color: "#303030",
    flexShrink: 1,
    textAlign: "center",
  },
});
