import { useFocusEffect } from "expo-router";
import {
  Cake,
  CalendarDays,
  KeyRound,
  Link2,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoApagarConta } from "@/components/BotaoApagarConta";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { FundoAmarelo } from "@/components/FundoAmarelo";
import { ModalConfirmadoAdmin } from "@/components/ModalAdmin";
import { ModalEditarConta, type CampoEdicao } from "@/components/ModalEditarConta";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  atualizarEmail,
  atualizarNome,
  atualizarSenha,
  atualizarTelefone,
} from "@/lib/conta";
import {
  obterFotoPerfil,
  salvarFotoPerfil,
  selecionarFotoDispositivo,
} from "@/lib/foto-perfil";
import {
  carregarPainel,
  formatarDataCurta,
  formatarDataNascimento,
  type DadosPainel,
} from "@/lib/painel";

export default function TelaConta() {
  const insets = useSafeAreaInsets();
  const { tema, modoEscuro, fonte } = useAcessibilidade();
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<CampoEdicao | null>(null);
  const [popup, setPopup] = useState<{
    titulo: string;
    mensagem: string;
    variante: "sucesso" | "aviso";
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      Promise.all([carregarPainel(), obterFotoPerfil()]).then(([resultado, foto]) => {
        if (!ativo) return;
        setDados(resultado);
        setFotoUrl(foto);
        setCarregando(false);
      });
      return () => {
        ativo = false;
      };
    }, [])
  );

  const fundo = modoEscuro ? tema.fundo : "#FFFFFF";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const nome = dados?.nome || "Sua conta";
  const status = dados?.provedor === "Google" ? "Conexão c. Google" : dados?.provedor || "E-mail e senha";

  const avisar = (
    titulo: string,
    mensagem: string,
    variante: "sucesso" | "aviso" = "aviso"
  ) => {
    setPopup({ titulo, mensagem, variante });
  };

  const trocarFoto = useCallback(async () => {
    const uri = await selecionarFotoDispositivo();
    if (!uri) {
      avisar(
        "Trocar foto",
        "Selecione uma imagem do seu dispositivo para atualizar sua foto de perfil."
      );
      return;
    }
    setFotoUrl(uri);
    await salvarFotoPerfil(uri);
    avisar("Confirmado!", "Sua foto de perfil foi atualizada.", "sucesso");
  }, []);

  const avisarEdicao = (campo: string) => {
    avisar(
      "Editar " + campo,
      "A edição desse dado estará disponível em breve. Fale com o suporte se precisar alterar agora."
    );
  };

  const abrirEdicao = (campo: CampoEdicao) => {
    if (dados?.provedor === "Google" && (campo === "email" || campo === "senha")) {
      avisar("Conta Google", "O e-mail e a senha dessa conta são gerenciados pelo Google.");
      return;
    }
    setEditando(campo);
  };

  const salvarEdicao = async (
    campo: CampoEdicao,
    v: Record<string, string>
  ): Promise<string | null> => {
    const resultado =
      campo === "nome"
        ? await atualizarNome(v.valor ?? "")
        : campo === "telefone"
        ? await atualizarTelefone(v.valor ?? "")
        : campo === "email"
        ? await atualizarEmail(v.valor ?? "")
        : await atualizarSenha(v.atual ?? "", v.nova ?? "", v.confirmacao ?? "");

    if (!resultado.ok) return resultado.erro;

    setDados(await carregarPainel(true));
    setTimeout(() => {
      avisar(
        "Confirmado!",
        resultado.mensagem ?? "Dados atualizados com sucesso.",
        "sucesso"
      );
    }, 160);
    return null;
  };

  const valorAtualEdicao =
    editando === "nome"
      ? dados?.nome ?? ""
      : editando === "telefone"
      ? dados?.telefone ?? ""
      : editando === "email"
      ? dados?.email ?? ""
      : "";

  if (carregando && !dados) {
    return (
      <SafeAreaView style={[styles.tela, { backgroundColor: fundo, justifyContent: "center", alignItems: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color={tema.roxoEscuro} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <FundoAmarelo />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <BotaoVoltar cor={modoEscuro ? texto : "#3B2600"} />

        <View style={styles.areaAvatar}>
          <View style={[styles.avatar, { backgroundColor: modoEscuro ? "#4A3A52" : "#D9D9D9", overflow: "hidden" }]}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <UserRound size={64} color={modoEscuro ? "#F4EDF8" : "#8A8080"} strokeWidth={1.4} />
            )}
          </View>
          <Pressable
            style={[styles.lapis, { backgroundColor: tema.roxo }]}
            onPress={() => void trocarFoto()}
            accessibilityRole="button"
            accessibilityLabel="Trocar foto"
          >
            <Pencil size={18} color="#2C1038" strokeWidth={2.4} />
          </Pressable>
        </View>

        <Text
          style={[styles.nome, { color: modoEscuro ? texto : "#3B2600", fontSize: fonte(32) }]}
          numberOfLines={2}
        >
          {nome}
        </Text>
        <Text
          style={[
            styles.subtitulo,
            { color: modoEscuro ? secundario : "#6D4A00", fontSize: fonte(15) },
          ]}
        >
          Descobridor de Mundos
        </Text>

        <View
          style={[
            styles.cartao,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <Campo
            icone={<Mail size={21} color={texto} />}
            rotulo="E-mail"
            valor={dados?.email || "Não informado"}
            onEdit={() => abrirEdicao("email")}
          />
          <Campo
            icone={<UserRound size={21} color={texto} />}
            rotulo="Nome completo"
            valor={dados?.nome || "Não informado"}
            onEdit={() => abrirEdicao("nome")}
          />
          <Campo
            icone={<Phone size={21} color={texto} />}
            rotulo="Telefone"
            valor={dados?.telefone || "Não informado"}
            onEdit={() => abrirEdicao("telefone")}
          />
          <Campo
            icone={<KeyRound size={21} color={texto} />}
            rotulo="Senha"
            valor="••••••••"
            onEdit={() => abrirEdicao("senha")}
          />
          <Campo
            icone={<Cake size={21} color={texto} />}
            rotulo="Data de nascimento"
            valor={formatarDataNascimento(dados?.nascimento ?? null) || "Não informado"}
            ultimo
          />
        </View>

        <View
          style={[
            styles.cartaoStatus,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <LinhaStatus
            icone={<Link2 size={21} color={texto} />}
            rotulo="Status da Conta"
            valor={status}
          />
          <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />
          <LinhaStatus
            icone={<CalendarDays size={21} color={texto} />}
            rotulo="Criação da Conta"
            valor={formatarDataCurta(dados?.criadoEm ?? null) || "Não informado"}
          />
        </View>

        <BotaoApagarConta />
      </ScrollView>

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

function Campo({
  icone,
  rotulo,
  valor,
  onEdit,
  ultimo = false,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  onEdit?: () => void;
  ultimo?: boolean;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <View
      style={[
        styles.campo,
        !ultimo && { borderBottomWidth: 1, borderBottomColor: tema.borda },
      ]}
    >
      <View style={[styles.iconeCampo, { backgroundColor: tema.cartaoSuave }]}>{icone}</View>
      <View style={styles.textoCampo}>
        <Text style={[styles.rotuloCampo, { color: tema.textoSecundario, fontSize: fonte(12) }]}>
          {rotulo}
        </Text>
        <Text
          style={[styles.valorCampo, { color: tema.texto, fontSize: fonte(16) }]}
          numberOfLines={1}
        >
          {valor}
        </Text>
      </View>
      {onEdit ? (
        <Pressable
          hitSlop={10}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${rotulo}`}
          style={styles.botaoLapis}
        >
          <Pencil size={19} color={tema.textoSecundario} />
        </Pressable>
      ) : (
        <View style={styles.botaoLapis} />
      )}
    </View>
  );
}

function LinhaStatus({
  icone,
  rotulo,
  valor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <View style={styles.linhaStatus}>
      <View style={[styles.iconeCampo, { backgroundColor: tema.cartaoSuave }]}>{icone}</View>
      <View style={styles.textoCampo}>
        <Text style={[styles.rotuloCampo, { color: tema.textoSecundario, fontSize: fonte(12) }]}>
          {rotulo}
        </Text>
        <Text style={[styles.valorCampo, { color: tema.texto, fontSize: fonte(16) }]}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  areaAvatar: {
    alignSelf: "center",
    marginTop: 4,
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  lapis: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  nome: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    marginTop: 4,
  },
  subtitulo: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginBottom: 18,
  },
  cartao: {
    borderRadius: 28,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    gap: 12,
  },
  iconeCampo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCampo: {
    flex: 1,
    paddingVertical: 8,
  },
  rotuloCampo: {
    fontFamily: "Poppins_300Light",
  },
  valorCampo: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 1,
  },
  botaoLapis: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  cartaoStatus: {
    marginTop: 16,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
    elevation: 4,
  },
  linhaStatus: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 66,
    gap: 12,
  },
  divisoria: {
    height: 1,
  },
});