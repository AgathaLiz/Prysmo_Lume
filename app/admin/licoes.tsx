import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, X } from "lucide-react-native";
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
import {
  criarLicao,
  listarLicoes,
  nomeDaLicao,
  removerLicao,
  type LicaoAdmin,
} from "@/lib/licoes-admin";
import { listarUnidades } from "@/lib/unidades";

/**
 * Tela 1 — Gerenciar Lições (mockup): a faixa roxa com o "Voltar" e o título e,
 * embaixo, um cartão por lição com o nome, o X vermelho (apagar, com
 * confirmação) e a seta que abre as informações da lição. O "+" da barra cria
 * uma lição nova.
 */
export default function TelaGerenciarLicoes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();

  const [licoes, setLicoes] = useState<LicaoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(false);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [criando, setCriando] = useState(false);
  const [licaoParaApagar, setLicaoParaApagar] = useState<LicaoAdmin | null>(null);
  const [apagando, setApagando] = useState(false);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  const recarregar = useCallback(() => {
    setCarregando(true);
    return listarLicoes().then((lista) => {
      setLicoes(lista ?? []);
      setFalha(lista === null);
      setCarregando(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      setCarregando(true);
      listarLicoes().then((lista) => {
        if (!ativo) return;
        setLicoes(lista ?? []);
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

  const avisar = useCallback((titulo: string, mensagem: string) => {
    setPopup({ titulo, mensagem, variante: "aviso" });
  }, []);

  const apagar = useCallback(async () => {
    if (!licaoParaApagar || apagando) return;
    const alvo = licaoParaApagar;
    setApagando(true);
    const resultado = await removerLicao(alvo.id);
    setApagando(false);
    setLicaoParaApagar(null);

    if (!resultado.ok) {
      setPopup({
        titulo: "Não deu para apagar",
        mensagem: resultado.erro ?? "Não deu para apagar a lição.",
        variante: "aviso",
      });
      return;
    }

    await recarregar();
    setPopup({
      titulo: "Confirmado!",
      mensagem: `A lição "${nomeDaLicao(alvo.nome)}" foi apagada.`,
      variante: "sucesso",
    });
  }, [apagando, licaoParaApagar, recarregar]);

  const confirmarRemocao = useCallback((licao: LicaoAdmin) => {
    setLicaoParaApagar(licao);
  }, []);

  const abrirLicao = useCallback(
    (licao: LicaoAdmin) => {
      router.push(`/admin/licao-info?id=${licao.id}` as never);
    },
    [router]
  );

  const criarNovaLicao = useCallback(async () => {
    if (criando) return;
    setCriando(true);

    const unidades = await listarUnidades();
    const primeiraUnidade = unidades?.[0] ?? null;

    if (!primeiraUnidade) {
      setCriando(false);
      avisar(
        "Criar lição",
        "Crie uma unidade antes: toda lição precisa estar dentro de uma unidade."
      );
      return;
    }

    const resultado = await criarLicao(primeiraUnidade.id);
    setCriando(false);

    if (!resultado.ok || !resultado.id) {
      avisar("Criar lição", resultado.erro ?? "Não deu para criar a lição agora.");
      return;
    }

    await recarregar();
    router.push(`/admin/licao-info?id=${resultado.id}` as never);
  }, [avisar, criando, recarregar, router]);

  return (
    <ProtecaoAdmin>
      <View style={styles.tela}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.rolagem,
            { paddingBottom: 170 + insets.bottom },
          ]}
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
              Gerenciar Lições
            </Text>
          </View>

          <View style={styles.lista}>
            {carregando ? (
              <ActivityIndicator style={styles.carregando} color={tema.texto} />
            ) : falha ? (
              <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Não deu para carregar as lições agora.
              </Text>
            ) : licoes.length === 0 ? (
              <Text style={[styles.aviso, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
                Ainda não há lições. Use o "+" para criar a primeira.
              </Text>
            ) : (
              licoes.map((licao) => (
                <View key={licao.id} style={[styles.cartao, { borderColor: tema.borda }]}>
                  <Text
                    style={[styles.nome, { color: tema.texto, fontSize: fonte(17) }]}
                    numberOfLines={1}
                  >
                    {nomeDaLicao(licao.nome)}
                  </Text>

                  <Pressable
                    style={styles.botaoApagar}
                    onPress={() => confirmarRemocao(licao)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Apagar a lição ${nomeDaLicao(licao.nome)}`}
                  >
                    <X size={20} color="#FFFFFF" strokeWidth={3} />
                  </Pressable>

                  <Pressable
                    style={styles.botaoDetalhes}
                    onPress={() => abrirLicao(licao)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver as informações da lição ${nomeDaLicao(licao.nome)}`}
                  >
                    <ChevronRight size={24} color={tema.texto} strokeWidth={2.6} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <BarraAdministrador ativo="adicionar" onAdicionar={criarNovaLicao} />

        <ModalConfirmacaoAdmin
          visivel={licaoParaApagar !== null}
          titulo="Tem certeza?"
          mensagem={`A lição "${nomeDaLicao(licaoParaApagar?.nome)}" será apagada. Esta ação não pode ser desfeita.`}
          carregando={apagando}
          aoCancelar={() => setLicaoParaApagar(null)}
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
  botaoDetalhes: {
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
