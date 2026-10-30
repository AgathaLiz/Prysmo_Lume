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
  Alert,
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
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
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

  const fundo = modoEscuro ? tema.fundo : "#FFFFFF";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const nome = dados?.nome || "Sua conta";
  const status = dados?.provedor === "Google" ? "Conexão c. Google" : dados?.provedor || "E-mail e senha";

  const avisarEdicao = (campo: string) => {
    Alert.alert(
      "Editar " + campo,
      "A edição desse dado estará disponível em breve. Fale com o suporte se precisar alterar agora."
    );
  };

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
          <View style={[styles.avatar, { backgroundColor: modoEscuro ? "#4A3A52" : "#D9D9D9" }]}>
            <UserRound size={64} color={modoEscuro ? "#F4EDF8" : "#8A8080"} strokeWidth={1.4} />
          </View>
          <Pressable
            style={[styles.lapis, { backgroundColor: tema.roxo }]}
            onPress={() => avisarEdicao("foto")}
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
            onEdit={() => avisarEdicao("e-mail")}
          />
          <Campo
            icone={<UserRound size={21} color={texto} />}
            rotulo="Nome completo"
            valor={dados?.nome || "Não informado"}
            onEdit={() => avisarEdicao("nome")}
          />
          <Campo
            icone={<Phone size={21} color={texto} />}
            rotulo="Telefone"
            valor={dados?.telefone || "Não informado"}
            onEdit={() => avisarEdicao("telefone")}
          />
          <Campo
            icone={<KeyRound size={21} color={texto} />}
            rotulo="Senha"
            valor="••••••••"
            onEdit={() => avisarEdicao("senha")}
          />
          <Campo
            icone={<Cake size={21} color={texto} />}
            rotulo="Data de nascimento"
            valor={formatarDataNascimento(dados?.nascimento ?? null) || "Não informado"}
            onEdit={() => avisarEdicao("data de nascimento")}
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
  onEdit: () => void;
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
      <Pressable
        hitSlop={10}
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${rotulo}`}
        style={styles.botaoLapis}
      >
        <Pencil size={19} color={tema.textoSecundario} />
      </Pressable>
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
