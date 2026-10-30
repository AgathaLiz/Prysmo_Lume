import { useFocusEffect, useRouter } from "expo-router";
import {
  Accessibility,
  ChevronRight,
  HelpCircle,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react-native";import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { carregarPainel, type DadosPainel } from "@/lib/painel";
import { supabase } from "@/lib/supabase";

export default function TelaUsuario() {
  const router = useRouter();
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

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login/contas" as never);
  }, [router]);

  const confirmarSaida = useCallback(() => {
    const mensagem = "Deseja mesmo sair da sua conta?";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(mensagem)) {
        void sair();
      }
      return;
    }

    Alert.alert("Sair da conta", mensagem, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => void sair() },
    ]);
  }, [sair]);

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 168 + insets.bottom },
        ]}
      >
        <View
          style={[
            styles.cartaoTopo,
            {
              backgroundColor: cartao,
              borderColor: modoEscuro ? tema.borda : "#E5E5E5",
              shadowColor: modoEscuro ? "#000" : "#5A3C6B",
            },
          ]}
        >
          <View style={styles.linhaPerfil}>
            <View style={[styles.avatar, { backgroundColor: modoEscuro ? "#4A3A52" : "#D9D9D9" }]}>
              <UserRound size={56} color={modoEscuro ? "#F4EDF8" : "#8A8080"} strokeWidth={1.5} />
            </View>
            <View style={styles.dadosPerfil}>
              <Text
                style={[styles.nome, { color: texto, fontSize: fonte(32) }]}
                numberOfLines={2}
              >
                {nome}
              </Text>
              <Text style={[styles.subtitulo, { color: secundario, fontSize: fonte(16) }]}>
                Descobridor de Mundos
              </Text>
            </View>
          </View>

          <View style={[styles.divisoria, { backgroundColor: tema.borda }]} />

          <TouchableOpacity
            style={styles.linhaConta}
            onPress={() => router.push("/pages/conta" as never)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Abrir informações da conta"
          >
            <UserRound size={26} color={texto} strokeWidth={2} />
            <Text style={[styles.textoConta, { color: texto, fontSize: fonte(18) }]}>
              Informações da Conta
            </Text>
            <ChevronRight size={26} color={secundario} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.cartaoEstatisticas,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#5A3C6B" },
          ]}
        >
          <ItemEstatistica
            rotulo="Moedas"
            corFundo={modoEscuro ? "#4A3A52" : "#FFE58C"}
            corRotulo={secundario}
          />
          <ItemEstatistica
            rotulo="Exp."
            corFundo={modoEscuro ? "#4A3A52" : "#FFE58C"}
            corRotulo={secundario}
            divisoria
          />
          <ItemEstatistica
            rotulo="Energia"
            corFundo={modoEscuro ? "#4A3A52" : "#FFE58C"}
            corRotulo={secundario}
            divisoria
          />
        </View>

        <View
          style={[
            styles.cartaoMenu,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#5A3C6B" },
          ]}
        >
          <LinhaMenu
            icone={<Palette size={25} color={texto} />}
            titulo="Aparência do Lume"
            onPress={() => router.push("/pages/aparencia" as never)}
          />
          <LinhaMenu
            icone={<Accessibility size={25} color={texto} />}
            titulo="Acessibilidade"
            onPress={() => router.push("/pages/acessibilidade" as never)}
          />
          <LinhaMenu
            icone={<HelpCircle size={25} color={texto} />}
            titulo="Central de Ajuda"
            onPress={() => router.push("/pages/ajuda" as never)}
          />
          <LinhaMenu
            icone={<Settings size={25} color={texto} />}
            titulo="Configurações Gerais"
            onPress={() => router.push("/pages/configuracoes" as never)}
            ultima
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botaoSair,
            { backgroundColor: tema.roxo, opacity: pressed ? 0.82 : 1 },
          ]}
          onPress={confirmarSaida}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <LogOut size={30} color="#303030" strokeWidth={2.3} />
          <Text style={[styles.textoSair, { fontSize: fonte(24) }]}>Sair da Conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ItemEstatistica({
  rotulo,
  corFundo,
  corRotulo,
  divisoria = false,
}: {
  rotulo: string;
  corFundo: string;
  corRotulo: string;
  divisoria?: boolean;
}) {
  const { fonte } = useAcessibilidade();
  return (
    <View style={styles.itemEstatistica}>
      {divisoria ? (
        <View style={[styles.divisoriaVertical, { backgroundColor: "#E5E5E5" }]} />
      ) : null}
      <Text style={[styles.rotuloEstatistica, { color: corRotulo, fontSize: fonte(14) }]}>
        {rotulo}
      </Text>
      <View style={[styles.circuloEstatistica, { backgroundColor: corFundo }]} />
    </View>
  );
}

function LinhaMenu({
  icone,
  titulo,
  onPress,
  ultima = false,
}: {
  icone: React.ReactNode;
  titulo: string;
  onPress: () => void;
  ultima?: boolean;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <TouchableOpacity
      style={[
        styles.linhaMenu,
        !ultima && { borderBottomWidth: 1, borderBottomColor: tema.borda },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={styles.iconeMenu}>{icone}</View>
      <Text style={[styles.tituloMenu, { color: tema.texto, fontSize: fonte(17) }]}>
        {titulo}
      </Text>
      <ChevronRight size={24} color={tema.textoSecundario} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cartaoTopo: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  linhaPerfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dadosPerfil: {
    flex: 1,
  },
  nome: {
    fontFamily: "Poppins_900Black",
    lineHeight: 34,
  },
  subtitulo: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 2,
  },
  divisoria: {
    height: 1,
    marginVertical: 16,
  },
  linhaConta: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 12,
  },
  textoConta: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  cartaoEstatisticas: {
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: "row",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  itemEstatistica: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  divisoriaVertical: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 1,
  },
  rotuloEstatistica: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  circuloEstatistica: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  cartaoMenu: {
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  linhaMenu: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconeMenu: {
    width: 30,
    alignItems: "center",
  },
  tituloMenu: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  botaoSair: {
    marginTop: 24,
    marginBottom: 16,
    minHeight: 72,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  textoSair: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    flexShrink: 1,
    textAlign: "center",
  },
});
