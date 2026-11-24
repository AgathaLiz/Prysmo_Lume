import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Plus, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { FundoAdmin } from "@/components/FundoAdmin";
import {
  ModalConfirmacaoAdmin,
  ModalConfirmadoAdmin,
} from "@/components/ModalAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  carregarAdmins,
  carregarNaoAdmins,
  definirAdmin,
  type PessoaAdmin,
} from "@/lib/admins";

/** Vermelho do botão de tirar a permissão, como no mockup. */
const VERMELHO = "#E23A2E";
/** Texto sobre a faixa amarela — as mesmas cores das outras telas do admin. */
const MARROM = "#3B2600";

/** Cartão de exemplo de pedido de permissão exibido para demonstração. */
const EXEMPLO_ID = -1;
const ADMIN_EXEMPLO: PessoaAdmin = {
  usuarioId: EXEMPLO_ID,
  nome: "Maria Oliveira (Exemplo)",
};

/**
 * Administrar permissões, como no mockup: a faixa amarela com o "Voltar" e o
 * título, a lista de administradores (cada um com o botão de tirar a permissão
 * e o de ver os detalhes) e o "+" para dar a permissão a mais alguém.
 *
 * Os nomes vêm da tabela `usuario` (`papel = 'admin'`). Tirar a permissão deixa
 * a pessoa sem papel; dar grava 'admin'.
 */
export default function TelaPermissoes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: alturaJanela } = useWindowDimensions();
  const { tema, fonte } = useAcessibilidade();

  const [admins, setAdmins] = useState<PessoaAdmin[]>([]);
  const [exemploRemovido, setExemploRemovido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(false);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [escolhendo, setEscolhendo] = useState(false);
  const [candidatos, setCandidatos] = useState<PessoaAdmin[]>([]);
  const [carregandoCandidatos, setCarregandoCandidatos] = useState(false);
  const [falhaCandidatos, setFalhaCandidatos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [pessoaParaRemover, setPessoaParaRemover] = useState<PessoaAdmin | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);

      carregarAdmins().then((lista) => {
        if (!ativo) return;
        setAdmins(lista ?? []);
        setFalha(lista === null);
        setCarregando(false);
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  // A faixa amarela fica atrás do cabeçalho, então medimos o cabeçalho para ela
  // terminar logo abaixo do título, com os cantos de baixo livres.
  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const avisar = useCallback((titulo: string, mensagem: string) => {
    setPopup({ titulo, mensagem, variante: "aviso" });
  }, []);

  const tirarPermissao = useCallback(async () => {
    if (!pessoaParaRemover || removendo) return;
    const pessoa = pessoaParaRemover;

    if (pessoa.usuarioId === EXEMPLO_ID) {
      setPessoaParaRemover(null);
      setExemploRemovido(true);
      setPopup({
        titulo: "Confirmado!",
        mensagem: `${pessoa.nome} foi removido da lista de exemplo.`,
        variante: "sucesso",
      });
      return;
    }

    setRemovendo(true);
    const erro = await definirAdmin(pessoa.usuarioId, false);
    setRemovendo(false);
    setPessoaParaRemover(null);

    if (erro) {
      avisar("Não deu para remover", erro);
      return;
    }

    setAdmins((lista) =>
      (lista ?? []).filter((item) => item.usuarioId !== pessoa.usuarioId)
    );
    setPopup({
      titulo: "Confirmado!",
      mensagem: `A permissão de administrador de ${pessoa.nome} foi removida.`,
      variante: "sucesso",
    });
  }, [avisar, pessoaParaRemover, removendo]);

  const confirmarRemocao = useCallback((pessoa: PessoaAdmin) => {
    setPessoaParaRemover(pessoa);
  }, []);

  const abrirEscolha = useCallback(async () => {
    setEscolhendo(true);
    setCarregandoCandidatos(true);
    setFalhaCandidatos(false);

    const lista = await carregarNaoAdmins();

    setCandidatos(lista ?? []);
    setFalhaCandidatos(lista === null);
    setCarregandoCandidatos(false);
  }, []);

  const darPermissao = useCallback(
    async (pessoa: PessoaAdmin) => {
      setSalvando(true);
      const erro = await definirAdmin(pessoa.usuarioId, true);
      setSalvando(false);

      if (erro) {
        avisar("Não deu para adicionar", erro);
        return;
      }

      setAdmins((lista) =>
        [...lista, pessoa].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      setEscolhendo(false);
      setPopup({
        titulo: "Confirmado!",
        mensagem: `${pessoa.nome} agora é administrador.`,
        variante: "sucesso",
      });
    },
    [avisar]
  );

  const verDetalhes = useCallback(
    (pessoa: PessoaAdmin) => {
      if (pessoa.usuarioId === EXEMPLO_ID) {
        avisar(
          pessoa.nome,
          "Exemplo de pedido de permissão de administrador. Você pode gerenciar permissões reais pelo botão '+' abaixo."
        );
        return;
      }

      avisar(
        pessoa.nome,
        `Administrador (ID #${pessoa.usuarioId}). Pode gerenciar permissões e criar lições. A tela de detalhes dessa pessoa entra junto com o próximo mockup.`
      );
    },
    [avisar]
  );

  const listaExibida = exemploRemovido ? admins : [...admins, ADMIN_EXEMPLO];
  const listaVazia = listaExibida.length === 0;

  // Faixa amarela com cerca de 1/4 da tela (mínimo 23% da altura da janela),
  // crescendo se o cabeçalho precisar de mais espaço (ex.: fonte ampliada).
  const alturaMinimaFaixa = Math.round(alturaJanela * 0.23);
  const alturaFundo = Math.max(
    alturaFaixa > 0 ? alturaFaixa + insets.top : 0,
    alturaMinimaFaixa
  );
  const minAlturaCabecalho = Math.max(0, alturaMinimaFaixa - insets.top - 16);

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      <FundoAdmin altura={alturaFundo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          // Folga para a barra flutuante, que fica por cima do conteúdo.
          { paddingBottom: 170 + insets.bottom },
        ]}
      >
        <View
          style={[styles.cabecalho, { minHeight: minAlturaCabecalho }]}
          onLayout={medirFaixa}
        >
          <BotaoVoltar
            onPress={() =>
              router.canGoBack() ? router.back() : router.navigate("/admin" as never)
            }
            cor={MARROM}
          />

          <Text style={[styles.titulo, { color: MARROM, fontSize: fonte(30) }]}>
            Gerenciar Admins
          </Text>
        </View>

        {carregando ? (
          <ActivityIndicator style={styles.carregando} color={tema.texto} />
        ) : listaVazia ? (
          <Text style={[styles.vazio, { color: tema.textoSecundario, fontSize: fonte(15) }]}>
            {falha
              ? "Não deu para carregar a lista agora. Volte para esta tela para tentar de novo."
              : "Nenhum administrador encontrado."}
          </Text>
        ) : (
          <>
            {falha ? (
              <Text
                style={[
                  styles.avisoDiscreto,
                  { color: tema.textoSecundario, fontSize: fonte(13) },
                ]}
              >
                Não foi possível carregar os administradores do servidor. Exibindo exemplo:
              </Text>
            ) : null}

            {listaExibida.map((pessoa) => (
              <View key={pessoa.usuarioId} style={styles.cartao}>
                <Text
                  style={[styles.nome, { color: tema.texto, fontSize: fonte(17) }]}
                  numberOfLines={1}
                >
                  {pessoa.nome}
                </Text>

                <Pressable
                  style={styles.remover}
                  onPress={() => confirmarRemocao(pessoa)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Tirar a permissão de ${pessoa.nome}`}
                >
                  <X size={20} color="#FFFFFF" strokeWidth={3.4} />
                </Pressable>

                <Pressable
                  style={styles.detalhes}
                  onPress={() => verDetalhes(pessoa)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Detalhes de ${pessoa.nome}`}
                >
                  <ChevronRight size={22} color={tema.texto} strokeWidth={2.6} />
                </Pressable>
              </View>
            ))}
          </>
        )}

        <Pressable
          style={({ pressed }) => [styles.adicionar, { opacity: pressed ? 0.85 : 1 }]}
          onPress={abrirEscolha}
          accessibilityRole="button"
          accessibilityLabel="Adicionar administrador"
        >
          <Plus size={38} color="#303030" strokeWidth={2.4} />
        </Pressable>
      </ScrollView>

      <BarraAdministrador
        onAdicionar={() => router.push("/admin/unidades" as never)}
      />

      <Modal
        visible={escolhendo}
        transparent
        animationType="fade"
        onRequestClose={() => setEscolhendo(false)}
      >
        <View style={styles.fundoModal}>
          <View style={[styles.caixaModal, { backgroundColor: tema.cartao }]}>
            <Text style={[styles.tituloModal, { color: tema.texto, fontSize: fonte(20) }]}>
              Adicionar administrador
            </Text>

            {carregandoCandidatos ? (
              <ActivityIndicator style={styles.carregandoModal} color={tema.texto} />
            ) : falhaCandidatos ? (
              <Text
                style={[styles.vazioModal, { color: tema.textoSecundario, fontSize: fonte(15) }]}
              >
                Não deu para carregar a lista de usuários agora.
              </Text>
            ) : candidatos.length === 0 ? (
              <Text
                style={[styles.vazioModal, { color: tema.textoSecundario, fontSize: fonte(15) }]}
              >
                Todo mundo já é administrador.
              </Text>
            ) : (
              <ScrollView
                style={styles.listaModal}
                contentContainerStyle={styles.itensModal}
                showsVerticalScrollIndicator={false}
              >
                {candidatos.map((pessoa) => (
                  <TouchableOpacity
                    key={pessoa.usuarioId}
                    style={[styles.opcao, { borderColor: tema.borda }]}
                    onPress={() => darPermissao(pessoa)}
                    disabled={salvando}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Tornar ${pessoa.nome} administrador`}
                  >
                    <Text
                      style={[styles.nomeOpcao, { color: tema.texto, fontSize: fonte(16) }]}
                      numberOfLines={1}
                    >
                      {pessoa.nome}
                    </Text>
                    <Plus size={20} color={tema.texto} strokeWidth={2.6} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Pressable
              style={[styles.fecharModal, { borderColor: tema.borda }]}
              onPress={() => setEscolhendo(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Text style={[styles.textoFecharModal, { color: tema.texto, fontSize: fonte(16) }]}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ModalConfirmacaoAdmin
        visivel={pessoaParaRemover !== null}
        titulo="Tem certeza?"
        mensagem={`${pessoaParaRemover?.nome ?? ""} deixa de administrar o Lume. A conta continua existindo, como aluno.`}
        textoConfirmar="Remover"
        carregando={removendo}
        aoCancelar={() => setPessoaParaRemover(null)}
        aoConfirmar={() => void tirarPermissao()}
      />

      <ModalConfirmadoAdmin
        visivel={popup !== null}
        titulo={popup?.titulo}
        mensagem={popup?.mensagem ?? ""}
        variante={popup?.variante}
        aoFechar={() => setPopup(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  cabecalho: {
    gap: 6,
    paddingBottom: 18,
  },
  titulo: {
    fontFamily: "Poppins_900Black",
    marginTop: 2,
  },
  carregando: {
    marginTop: 40,
  },
  vazio: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 20,
    textAlign: "center",
  },
  avisoDiscreto: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    textAlign: "center",
  },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3ED",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
    elevation: 4,
  },
  nome: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  remover: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: VERMELHO,
    alignItems: "center",
    justifyContent: "center",
  },
  detalhes: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3ED",
  },
  adicionar: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E3ED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  caixaModal: {
    borderRadius: 24,
    padding: 20,
  },
  tituloModal: {
    fontFamily: "Poppins_900Black",
    marginBottom: 12,
  },
  carregandoModal: {
    marginVertical: 24,
  },
  vazioModal: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
  },
  listaModal: {
    maxHeight: 320,
  },
  itensModal: {
    gap: 10,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  nomeOpcao: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  fecharModal: {
    marginTop: 16,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textoFecharModal: {
    fontFamily: "Poppins_900Black",
  },
});
