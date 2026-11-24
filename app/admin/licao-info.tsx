import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { FaixaRoxaAdmin } from "@/components/FaixaRoxaAdmin";
import { ProtecaoAdmin } from "@/components/ProtecaoAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { carregarDetalhesLicao, type DetalhesLicao } from "@/lib/licoes-admin";

/** Cor dos destaques (as palavras-chave entre ** do texto do banco). */
const DESTAQUE = "#891CC0";

const ABAS = [
  { id: "inicio", rotulo: "Início" },
  { id: "questoes", rotulo: "Questões" },
  { id: "pratica", rotulo: "Prática" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

/** Quebra o texto nos trechos entre ** e pinta esses trechos de roxo. */
function comDestaque(texto: string) {
  return texto.split("**").map((parte, indice) =>
    indice % 2 === 1 ? (
      <Text key={indice} style={styles.destaque}>
        {parte}
      </Text>
    ) : (
      <Text key={indice}>{parte}</Text>
    )
  );
}

function LinhaInfo({
  rotulo,
  corRotulo,
  tamanho,
  children,
  comDivisoria,
}: {
  rotulo: string;
  corRotulo: string;
  tamanho: number;
  children: React.ReactNode;
  comDivisoria: boolean;
}) {
  return (
    <>
      {comDivisoria ? <View style={styles.divisoria} /> : null}

      <View style={styles.linhaInfo}>
        <Text
          style={[styles.rotuloInfo, { color: corRotulo, fontSize: tamanho - 2 }]}
        >
          {rotulo}
        </Text>

        <View style={styles.valorInfo}>{children}</View>
      </View>
    </>
  );
}

/**
 * Tela 2 — Informações da Lição (mockup): faixa roxa com o "Voltar", o título e
 * as abas (Início, Questões, Prática). A aba "Início" mostra o título, o
 * subtítulo (com as palavras-chave em roxo) e os passos da lição.
 */
export default function TelaInformacoesLicao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const aulasId = useMemo(() => Number(id ?? 0), [id]);

  const [detalhes, setDetalhes] = useState<DetalhesLicao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [aba, setAba] = useState<AbaId>("inicio");

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      carregarDetalhesLicao(aulasId).then((resultado) => {
        if (!ativo) return;
        setDetalhes(resultado);
        setCarregando(false);
      });

      return () => {
        ativo = false;
      };
    }, [aulasId])
  );

  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const voltar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/admin/unidades" as never);
    }
  }, [router]);

  const irParaLicoes = useCallback(() => {
    router.navigate("/admin/licoes" as never);
  }, [router]);

  return (
    <ProtecaoAdmin>
      <View style={styles.tela}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.rolagem, { paddingBottom: 170 + insets.bottom }]}
        >
          <View
            style={[styles.faixa, { paddingTop: insets.top + 8 }]}
            onLayout={medirFaixa}
          >
            {alturaFaixa > 0 ? <FaixaRoxaAdmin altura={alturaFaixa} /> : null}

            <BotaoVoltar cor={tema.texto} onPress={voltar} />

            <Text style={[styles.tituloFaixa, { fontSize: fonte(29) }]}>
              Informações
            </Text>

            <View style={styles.abas}>
              {ABAS.map((item) => {
                const ativa = item.id === aba;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setAba(item.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: ativa }}
                    style={styles.aba}
                  >
                    <Text
                      style={[
                        styles.textoAba,
                        {
                          color: ativa ? tema.texto : "#7A6C82",
                          fontSize: fonte(19),
                        },
                      ]}
                    >
                      {item.rotulo}
                    </Text>

                    <View
                      style={[
                        styles.sublinhado,
                        { backgroundColor: ativa ? tema.texto : "transparent" },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {carregando ? (
            <ActivityIndicator style={styles.carregando} color={tema.texto} />
          ) : !detalhes ? (
            <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Não deu para abrir esta lição agora.
            </Text>
          ) : (
            <View style={styles.conteudo}>
              {aba === "inicio" ? (
                <View style={[styles.cartao, { borderColor: tema.borda }]}>
                  <LinhaInfo
                    rotulo="Título"
                    corRotulo={tema.textoSecundario}
                    tamanho={fonte(17)}
                    comDivisoria={false}
                  >
                    <Text
                      style={[styles.valorTexto, { color: tema.texto, fontSize: fonte(17) }]}
                    >
                      {detalhes.titulo}
                    </Text>
                  </LinhaInfo>

                  <LinhaInfo
                    rotulo="Subtítulo"
                    corRotulo={tema.textoSecundario}
                    tamanho={fonte(17)}
                    comDivisoria
                  >
                    {detalhes.subtitulo.length > 0 ? (
                      <Text
                        style={[styles.valorTexto, { color: tema.texto, fontSize: fonte(16) }]}
                      >
                        {comDestaque(detalhes.subtitulo)}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.valorTexto,
                          { color: tema.textoSecundario, fontSize: fonte(16) },
                        ]}
                      >
                        Esta lição ainda não tem subtítulo.
                      </Text>
                    )}
                  </LinhaInfo>

                  <LinhaInfo
                    rotulo="Passos"
                    corRotulo={tema.textoSecundario}
                    tamanho={fonte(17)}
                    comDivisoria
                  >
                    {detalhes.passos.map((passo, indice) => (
                      <Text
                        key={passo}
                        style={[styles.valorTexto, { color: tema.texto, fontSize: fonte(16) }]}
                      >
                        <Text style={styles.numeroPasso}>{indice + 1}. </Text>
                        {passo}
                        {indice === detalhes.passos.length - 1 ? "." : ";"}
                      </Text>
                    ))}
                  </LinhaInfo>
                </View>
              ) : null}

              {aba === "questoes" ? (
                detalhes.questoes.length === 0 ? (
                  <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                    Esta lição ainda não tem perguntas.
                  </Text>
                ) : (
                  detalhes.questoes.map((questao, indice) => (
                    <View
                      key={questao.id}
                      style={[styles.cartao, styles.cartaoQuestao, { borderColor: tema.borda }]}
                    >
                      <Text
                        style={[styles.valorTexto, { color: tema.texto, fontSize: fonte(17) }]}
                      >
                        {indice + 1}. {questao.pergunta}
                      </Text>

                      {questao.alternativas.map((alternativa) => (
                        <Text
                          key={alternativa}
                          style={[
                            styles.alternativa,
                            { color: tema.textoSecundario, fontSize: fonte(15) },
                          ]}
                        >
                          • {alternativa}
                        </Text>
                      ))}
                    </View>
                  ))
                )
              ) : null}

              {aba === "pratica" ? (
                detalhes.praticas.length === 0 ? (
                  <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                    Esta lição ainda não tem prática cadastrada.
                  </Text>
                ) : (
                  <View style={[styles.cartao, { borderColor: tema.borda }]}>
                    {detalhes.praticas.map((pratica, indice) => (
                      <Text
                        key={pratica}
                        style={[
                          styles.valorTexto,
                          { color: tema.texto, fontSize: fonte(16), marginTop: indice === 0 ? 0 : 10 },
                        ]}
                      >
                        <Text style={styles.numeroPasso}>{indice + 1}. </Text>
                        {comDestaque(pratica)}
                      </Text>
                    ))}
                  </View>
                )
              ) : null}
            </View>
          )}
        </ScrollView>

        <BarraAdministrador ativo="adicionar" onAdicionar={irParaLicoes} />
      </View>
    </ProtecaoAdmin>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  rolagem: {
    flexGrow: 1,
  },
  faixa: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tituloFaixa: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    marginTop: 2,
  },
  abas: {
    flexDirection: "row",
    gap: 22,
    marginTop: 16,
  },
  aba: {
    alignItems: "center",
    gap: 6,
  },
  textoAba: {
    fontFamily: "Poppins_800ExtraBold",
  },
  sublinhado: {
    height: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  carregando: {
    marginTop: 40,
  },
  aviso: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 24,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  cartaoQuestao: {
    paddingVertical: 16,
  },
  divisoria: {
    height: 1,
    backgroundColor: "#EDE9F0",
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
  },
  rotuloInfo: {
    width: 78,
    fontFamily: "Poppins_600SemiBold",
  },
  valorInfo: {
    flex: 1,
    alignItems: "center",
  },
  valorTexto: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  destaque: {
    color: DESTAQUE,
  },
  numeroPasso: {
    color: DESTAQUE,
  },
  alternativa: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 6,
    textAlign: "center",
  },
});
