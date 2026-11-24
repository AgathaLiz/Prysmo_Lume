import { useFocusEffect, useRouter } from "expo-router";
import { Pencil, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
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
import {
  ModalConfirmacaoAdmin,
  ModalConfirmadoAdmin,
} from "@/components/ModalAdmin";
import { ProtecaoAdmin } from "@/components/ProtecaoAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { listarUnidades, removerUnidade, type Unidade } from "@/lib/unidades";

/**
 * Tela 4 — Gerenciar Unidades (mockup): faixa roxa com o título e um cartão por
 * unidade, com o X vermelho (apagar, com confirmação) e o lápis que abre a
 * edição. O "+" da barra leva para a criação de unidade.
 */
export default function TelaGerenciarUnidades() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(false);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [unidadeParaApagar, setUnidadeParaApagar] = useState<Unidade | null>(null);
  const [apagando, setApagando] = useState(false);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  const recarregar = useCallback(() => {
    return listarUnidades().then((lista) => {
      setUnidades(lista ?? []);
      setFalha(lista === null);
      setCarregando(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      setCarregando(true);
      listarUnidades().then((lista) => {
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

  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const apagar = useCallback(async () => {
    if (!unidadeParaApagar || apagando) return;
    const alvo = unidadeParaApagar;
    setApagando(true);
    const resultado = await removerUnidade(alvo.id);
    setApagando(false);
    setUnidadeParaApagar(null);

    if (!resultado.ok) {
      setPopup({
        titulo: "Não deu para apagar",
        mensagem: resultado.erro ?? "Não deu para apagar a unidade.",
        variante: "aviso",
      });
      return;
    }

    await recarregar();
    setPopup({
      titulo: "Confirmado!",
      mensagem: `A unidade "${alvo.nome}" foi apagada.`,
      variante: "sucesso",
    });
  }, [apagando, recarregar, unidadeParaApagar]);

  const confirmarRemocao = useCallback((unidade: Unidade) => {
    setUnidadeParaApagar(unidade);
  }, []);

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

            <BotaoVoltar
              cor={tema.texto}
              onPress={() =>
                router.canGoBack() ? router.back() : router.navigate("/admin" as never)
              }
            />

            <Text style={[styles.tituloFaixa, { fontSize: fonte(29) }]}>
              Gerenciar Unidades
            </Text>
          </View>

          <View style={styles.lista}>
            {carregando ? (
              <ActivityIndicator style={styles.carregando} color={tema.texto} />
            ) : falha ? (
              <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Não deu para carregar as unidades agora.
              </Text>
            ) : unidades.length === 0 ? (
              <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Ainda não há unidades. Use o "+" para criar a primeira.
              </Text>
            ) : (
              unidades.map((unidade) => (
                <View key={unidade.id} style={[styles.cartao, { borderColor: tema.borda }]}>
                  <Text
                    style={[styles.nome, { color: tema.texto, fontSize: fonte(17) }]}
                    numberOfLines={1}
                  >
                    {unidade.nome}
                  </Text>

                  <Pressable
                    style={styles.botaoApagar}
                    onPress={() => confirmarRemocao(unidade)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Apagar a unidade ${unidade.nome}`}
                  >
                    <X size={20} color="#FFFFFF" strokeWidth={3} />
                  </Pressable>

                  <Pressable
                    style={styles.botaoEditar}
                    onPress={() => router.push(`/admin/editar-unidade?id=${unidade.id}` as never)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar a unidade ${unidade.nome}`}
                  >
                    <Pencil size={20} color={tema.texto} strokeWidth={2.4} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <BarraAdministrador
          ativo="adicionar"
          onAdicionar={() => router.navigate("/admin/unidades" as never)}
        />

        <ModalConfirmacaoAdmin
          visivel={unidadeParaApagar !== null}
          titulo="Tem certeza?"
          mensagem={`A unidade "${unidadeParaApagar?.nome ?? ""}" será apagada. Esta ação não pode ser desfeita.`}
          carregando={apagando}
          aoCancelar={() => setUnidadeParaApagar(null)}
          aoConfirmar={() => void apagar()}
        />

        <ModalConfirmadoAdmin
          visivel={popup !== null}
          titulo={popup?.titulo}
          mensagem={popup?.mensagem ?? ""}
          variante={popup?.variante}
          aoFechar={() => setPopup(null)}
        />
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
    paddingBottom: 20,
  },
  tituloFaixa: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    marginTop: 2,
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 14,
  },
  carregando: {
    marginTop: 40,
  },
  aviso: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  nome: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  botaoApagar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E23A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoEditar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E9E3ED",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
});
