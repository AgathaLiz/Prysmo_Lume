import { useFocusEffect, useRouter } from "expo-router";
import {
  CircleUserRound,
  IdCard,
  Lock,
  Pencil,
  UserRound,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { FundoAdmin } from "@/components/FundoAdmin";
import { ModalConfirmadoAdmin } from "@/components/ModalAdmin";
import { ModalEditarConta, type CampoEdicao } from "@/components/ModalEditarConta";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { atualizarNome, atualizarSenha } from "@/lib/conta";
import { carregarPainel, type DadosPainel } from "@/lib/painel";

/** Texto sobre a faixa do topo — as mesmas cores da tela de conta do aluno. */
const MARROM = "#3B2600";
const MARROM_SUAVE = "#6D4A00";

/** Nível do administrador. Fixo por enquanto: ainda não existe campo no banco. */
const NIVEL_ADMIN = "Sênior";
/** Quem concebeu o Lume. */
const CONCEPCAO = "Grupo Prysmo";

/** Data curta com o ano em dois dígitos, como no mockup: 23/10/24. */
function formatarDataCurta(data: string | null): string {
  if (!data) return "";
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return data;
  const dia = String(parsed.getDate()).padStart(2, "0");
  const mes = String(parsed.getMonth() + 1).padStart(2, "0");
  const ano = String(parsed.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

/**
 * Informações da conta do administrador: o perfil sobre a faixa do topo
 * (`Fundo-adm.png`, o degradê do design), os dados editáveis (nome, senha e o
 * ID) e o bloco "Informações Adicionais" (nível, concepção e data de criação).
 *
 * O nome, o ID e a data vêm do banco; nome e senha podem ser alterados pelo
 * mesmo modal da tela de conta do aluno.
 */
export default function TelaAdminConta() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [editando, setEditando] = useState<CampoEdicao | null>(null);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregarPainel().then((resultado) => {
        if (ativo) setDados(resultado);
      });
      return () => {
        ativo = false;
      };
    }, [])
  );

  // A faixa amarela fica atrás do bloco do topo, então medimos esse bloco para
  // ela terminar logo abaixo do cartão de campos — antes do "Informações
  // Adicionais" — mesmo com a letra maior do app.
  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const nome = dados?.nome || "Sua conta";
  const identificador = dados?.usuarioId ? `#${dados.usuarioId}` : "#—";

  const avisar = (titulo: string, mensagem: string, variante: "sucesso" | "aviso" = "aviso") => {
    setPopup({ titulo, mensagem, variante });
  };

  const salvarEdicao = async (
    campo: CampoEdicao,
    v: Record<string, string>
  ): Promise<string | null> => {
    const resultado =
      campo === "nome"
        ? await atualizarNome(v.valor ?? "")
        : await atualizarSenha(v.atual ?? "", v.nova ?? "", v.confirmacao ?? "");

    if (!resultado.ok) return resultado.erro;

    setDados(await carregarPainel());
    avisar(
      "Confirmado!",
      resultado.mensagem ??
        (campo === "nome"
          ? "Nome atualizado com sucesso."
          : "Senha atualizada com sucesso."),
      "sucesso"
    );
    return null;
  };

  const valorAtualEdicao = editando === "nome" ? dados?.nome ?? "" : "";

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      {alturaFaixa > 0 ? <FundoAdmin altura={alturaFaixa + insets.top} /> : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          // Folga para a barra flutuante, que fica por cima do conteúdo.
          { paddingBottom: 140 + insets.bottom },
        ]}
      >
        <View onLayout={medirFaixa}>
          <BotaoVoltar
            onPress={() =>
              router.canGoBack() ? router.back() : router.navigate("/admin" as never)
            }
            cor={MARROM}
          />

          <View style={styles.areaAvatar}>
            <View style={styles.avatar}>
              <UserRound size={68} color="#8A8080" strokeWidth={1.4} />
            </View>

            <Pressable
              style={styles.lapis}
              onPress={() =>
                avisar(
                  "Trocar foto",
                  "A troca da foto estará disponível em breve. Fale com o suporte se precisar alterar agora."
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Trocar foto"
            >
              <Pencil size={19} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
          </View>

          <Text
            style={[styles.nome, { color: MARROM, fontSize: fonte(32), lineHeight: fonte(40) }]}
            numberOfLines={2}
          >
            {nome}
          </Text>
          <Text style={[styles.subtitulo, { color: MARROM_SUAVE, fontSize: fonte(16) }]}>
            Administrador
          </Text>

          <View style={[styles.cartao, { shadowColor: "#7A4A00" }]}>
            <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />

            <Campo
              icone={<CircleUserRound size={24} color={tema.texto} strokeWidth={2} />}
              valor={dados?.nome || "Não informado"}
              rotulo="nome"
              onEdit={() => setEditando("nome")}
            />

            <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />

            <View style={styles.linhaDupla}>
              <View style={styles.metade}>
                <Campo
                  compacto
                  icone={<Lock size={20} color={tema.texto} strokeWidth={2} />}
                  valor="•••••••••"
                  rotulo="senha"
                  onEdit={() => setEditando("senha")}
                />
              </View>

              <View style={[styles.separador, { backgroundColor: tema.borda }]} />

              <View style={styles.metade}>
                <Campo
                  compacto
                  icone={<IdCard size={20} color={tema.texto} strokeWidth={2} />}
                  valor={identificador}
                  rotulo="ID da conta"
                  onEdit={() =>
                    avisar(
                      "ID da conta",
                      "Esse número é gerado pelo sistema e não pode ser alterado."
                    )
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.tituloSecao, { color: MARROM, fontSize: fonte(19) }]}>
          Informações Adicionais
        </Text>

        <View style={[styles.cartao, { shadowColor: "#7A4A00" }]}>
          <LinhaInfo rotulo="Nível de Conta" valor={NIVEL_ADMIN} />
          <LinhaInfo rotulo="Concepção Por" valor={CONCEPCAO} />
          <LinhaInfo
            rotulo="Data de Criação"
            valor={formatarDataCurta(dados?.criadoEm ?? null) || "Não informado"}
          />
        </View>
      </ScrollView>

      <BarraAdministrador
        onAdicionar={() => router.push("/admin/unidades" as never)}
      />

      <ModalEditarConta
        campo={editando}
        valorAtual={valorAtualEdicao}
        aoFechar={() => setEditando(null)}
        aoSalvar={salvarEdicao}
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

/** Linha editável: ícone, valor e o botão do lápis. */
function Campo({
  icone,
  valor,
  rotulo,
  onEdit,
  compacto = false,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
  onEdit: () => void;
  /** Versão menor, usada nas duas metades da linha de baixo. */
  compacto?: boolean;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <View style={[styles.campo, compacto && styles.campoCompacto]}>
      <View
        style={[
          styles.iconeCampo,
          compacto && styles.iconeCampoCompacto,
          { backgroundColor: tema.cartaoSuave },
        ]}
      >
        {icone}
      </View>

      <Text
        style={[styles.valorCampo, { color: tema.texto, fontSize: fonte(compacto ? 15 : 17) }]}
        numberOfLines={1}
      >
        {valor}
      </Text>

      <Pressable
        style={[
          styles.botaoLapis,
          compacto && styles.botaoLapisCompacto,
          { backgroundColor: tema.cartaoSuave },
        ]}
        onPress={onEdit}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${rotulo}`}
      >
        <Pencil size={compacto ? 18 : 20} color={tema.texto} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

/** Linha apenas de leitura: rótulo à esquerda, valor à direita. */
function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <View style={styles.linhaInfo}>
      <Text style={[styles.rotuloInfo, { color: tema.texto, fontSize: fonte(17) }]}>
        {rotulo}
      </Text>
      <Text
        style={[styles.valorInfo, { color: tema.textoSecundario, fontSize: fonte(17) }]}
        numberOfLines={1}
      >
        {valor}
      </Text>
    </View>
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
  areaAvatar: {
    alignSelf: "center",
    marginTop: 4,
    width: 122,
    height: 122,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  lapis: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  nome: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    marginTop: 4,
  },
  subtitulo: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: 20,
  },
  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  divisoria: {
    height: 1,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 74,
    gap: 12,
  },
  campoCompacto: {
    minHeight: 70,
    gap: 8,
  },
  iconeCampo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconeCampoCompacto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  valorCampo: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  botaoLapis: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoLapisCompacto: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  linhaDupla: {
    flexDirection: "row",
    alignItems: "center",
  },
  metade: {
    flex: 1,
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 14,
  },
  tituloSecao: {
    fontFamily: "Poppins_800ExtraBold",
    marginTop: 22,
    marginBottom: 12,
    marginLeft: 4,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    gap: 12,
  },
  rotuloInfo: {
    fontFamily: "Poppins_600SemiBold",
  },
  valorInfo: {
    flexShrink: 1,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "right",
  },
});
