import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Code, Plus, Settings, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { supabase } from "@/lib/supabase";

/** Quantas lições aparecem antes do "Ver Mais". */
const INICIAIS = 3;

/**
 * Cor e ícone de cada linha do banco de lições. O banco ainda não guarda cor
 * nem ícone por lição, então alternamos estas três, na ordem, como no mockup.
 */
const ESTILOS: { cor: string; Icone: LucideIcon }[] = [
  { cor: "#52AE32", Icone: User },
  { cor: "#E23A2E", Icone: Code },
  { cor: "#52AE32", Icone: Settings },
];

type Unidade = {
  id: number;
  aulaId: number;
  nome: string;
};

type AulaDaLicao = {
  aulas_id: number;
  nome: string | null;
};

type LicaoBanco = {
  licoes_id: number;
  aulas: AulaDaLicao | AulaDaLicao[] | null;
};

/** O banco pode devolver a aula ligada como objeto ou como lista de um. */
function primeiraAula(valor: LicaoBanco["aulas"]): AulaDaLicao | null {
  if (!valor) return null;
  return Array.isArray(valor) ? valor[0] ?? null : valor;
}

/** Todas as lições que já existem no app, na ordem de criação. */
async function carregarUnidades(): Promise<Unidade[] | null> {
  try {
    const { data, error } = await supabase
      .from("licoes")
      .select("licoes_id, aulas(aulas_id, nome)")
      .order("licoes_id", { ascending: true });

    if (error) {
      console.log("Erro ao ler o banco de lições:", error.message);
      return null;
    }

    return ((data ?? []) as unknown as LicaoBanco[]).map((licao) => {
      const aula = primeiraAula(licao.aulas);
      return {
        id: licao.licoes_id,
        aulaId: aula?.aulas_id ?? licao.licoes_id,
        nome: aula?.nome?.trim() || "*Lição sem Título*",
      };
    });
  } catch (erro) {
    console.log("Erro ao ler o banco de lições:", erro);
    return null;
  }
}

/**
 * Gerenciando Unidades, como no mockup: o "Banco de Lições" com as lições que
 * já existem (e o "Ver Mais") e, embaixo, o painel com o degradê do design e os
 * botões "Criar Nova Unidade" e "Editar Unidades". A barra fica com o "+" aceso.
 */
export default function TelaUnidades() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(false);
  const [expandido, setExpandido] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      carregarUnidades().then((lista) => {
        if (!ativo) return;
        setUnidades(lista ?? []);
        setFalha(lista === null);
        setCarregando(false);
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  const criarUnidade = useCallback(() => {
    router.push("/admin/criar-unidade" as never);
  }, [router]);

  const editarUnidades = useCallback(() => {
    router.push("/admin/gerenciar-unidades" as never);
  }, [router]);

  const abrirLicao = useCallback(
    (licao: Unidade) => {
      router.push(`/admin/licao-info?id=${licao.aulaId}` as never);
    },
    [router]
  );

  const visiveis = expandido ? unidades : unidades.slice(0, INICIAIS);
  const temMais = unidades.length > INICIAIS;

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        <View style={styles.cartao}>
          <Text style={[styles.tituloCartao, { color: tema.texto, fontSize: fonte(20) }]}>
            Banco de Lições
          </Text>

          <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />

          {carregando ? (
            <ActivityIndicator style={styles.carregando} color={tema.texto} />
          ) : falha ? (
            <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Não deu para carregar as lições agora.
            </Text>
          ) : unidades.length === 0 ? (
            <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
              Ainda não há lições cadastradas.
            </Text>
          ) : (
            visiveis.map((unidade, indice) => {
              const { cor, Icone } = ESTILOS[indice % ESTILOS.length];

              return (
                <View key={unidade.id}>
                  {indice > 0 ? (
                    <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />
                  ) : null}

                  <Pressable
                    style={styles.linha}
                    onPress={() => abrirLicao(unidade)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir as informações da lição ${unidade.nome}`}
                  >
                    <Icone size={22} color={cor} strokeWidth={2.4} />

                    <Text
                      style={[styles.nomeLicao, { color: cor, fontSize: fonte(17) }]}
                      numberOfLines={1}
                    >
                      {unidade.nome}
                    </Text>

                    <ChevronRight size={22} color={cor} strokeWidth={2.8} />
                  </Pressable>
                </View>
              );
            })
          )}

          {temMais ? (
            <>
              <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />

              <Pressable
                style={styles.verMais}
                onPress={() => setExpandido((valor) => !valor)}
                accessibilityRole="button"
                accessibilityLabel={expandido ? "Ver menos lições" : "Ver mais lições"}
              >
                <Plus size={26} color={tema.texto} strokeWidth={2.8} />
                <Text style={[styles.textoVerMais, { color: tema.texto, fontSize: fonte(18) }]}>
                  {expandido ? "Ver Menos" : "Ver Mais"}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <View style={[styles.painel, { paddingBottom: 126 + insets.bottom }]}>
          <LinearGradient
            colors={["#CA7CF6", "#FFE38E", "#CA7CF6"]}
            start={{ x: 0, y: 0.45 }}
            end={{ x: 1, y: 0.55 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.25)", "rgba(255, 255, 255, 0)", "rgba(202, 124, 246, 0.22)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
            onPress={criarUnidade}
            accessibilityRole="button"
            accessibilityLabel="Criar nova unidade"
          >
            <Text
              style={[styles.textoBotao, { fontSize: fonte(24) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Criar Nova Unidade
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
            onPress={editarUnidades}
            accessibilityRole="button"
            accessibilityLabel="Editar unidades"
          >
            <Text
              style={[styles.textoBotao, { fontSize: fonte(24) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Editar Unidades
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BarraAdministrador ativo="adicionar" onAdicionar={criarUnidade} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  conteudo: {
    // flexGrow deixa o painel de baixo esticar até o fim da tela quando a lista
    // é curta, como no mockup (o degradê encosta embaixo).
    flexGrow: 1,
    paddingTop: 14,
  },
  cartao: {
    marginHorizontal: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9E3ED",
    // Sem padding nas laterais: as linhas/divisórias atravessam o cartão todo.
    overflow: "hidden",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  tituloCartao: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  carregando: {
    marginVertical: 32,
  },
  aviso: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginVertical: 26,
    paddingHorizontal: 18,
  },
  divisoria: {
    height: 1,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 60,
    paddingHorizontal: 18,
  },
  nomeLicao: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  verMais: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 68,
    backgroundColor: "#FFFFFF",
  },
  textoVerMais: {
    fontFamily: "Poppins_600SemiBold",
  },
  painel: {
    // Cresce até o fim da tela (o degradê encosta embaixo) e nunca encolhe
    // abaixo disso, para os botões não sumirem quando a lista é longa.
    flexGrow: 1,
    minHeight: 330,
    marginTop: 18,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
    paddingTop: 22,
    paddingHorizontal: 18,
    gap: 18,
  },
  botao: {
    height: 92,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 4,
  },
  botaoPressionado: {
    opacity: 0.9,
  },
  textoBotao: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    textAlign: "center",
  },
});
