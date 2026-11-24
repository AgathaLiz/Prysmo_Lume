import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Library,
  LogOut,
  Pencil,
  UserCog,
  UserRound,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { FundoAdminPerfil } from "@/components/FundoAdmin";
import { ModalConfirmacaoAdmin } from "@/components/ModalAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { carregarPainel, type DadosPainel } from "@/lib/painel";
import { supabase } from "@/lib/supabase";

/**
 * Tela inicial do administrador (mockup "Início"): a faixa do perfil ocupando
 * toda a largura, com a foto, o nome e o papel; abaixo, o atalho para as
 * informações da conta, o bloco de opções avançadas (administrar permissões) e
 * o "Sair".
 *
 * A barra de baixo é a do administrador: o Início e o "+" que leva para a
 * criação de lição. O nome vem do banco (`usuario.nome_completo`), como nas
 * outras telas de perfil.
 */
export default function TelaAdmin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tema, fonte } = useAcessibilidade();
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

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

  // A faixa é desenhada atrás do conteúdo, então medimos o bloco do perfil
  // para ela acompanhar exatamente a altura dele (inclusive com letra maior).
  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const nome = dados?.nome || "Sua conta";

  const sair = useCallback(async () => {
    setConfirmandoSaida(false);
    await supabase.auth.signOut();
    router.replace("/auth/login/contas" as never);
  }, [router]);

  const confirmarSaida = useCallback(() => {
    setConfirmandoSaida(true);
  }, []);

  const abrirConta = useCallback(() => {
    router.push("/admin/conta" as never);
  }, [router]);

  return (
    <View style={styles.tela}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.rolagem,
          // Folga para a barra flutuante, que fica por cima do conteúdo.
          { paddingBottom: 160 + insets.bottom },
        ]}
      >
        <View
          style={[styles.faixaPerfil, { paddingTop: insets.top + 18 }]}
          onLayout={medirFaixa}
        >
          {alturaFaixa > 0 ? <FundoAdminPerfil altura={alturaFaixa} /> : null}

          <View style={styles.areaAvatar}>
            <View style={styles.avatar}>
              <UserRound size={76} color="#8A8080" strokeWidth={1.4} />
            </View>

            <TouchableOpacity
              style={styles.lapis}
              onPress={abrirConta}
              activeOpacity={0.8}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Editar as informações da conta"
            >
              <Pencil size={21} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.nome, { fontSize: fonte(34), lineHeight: fonte(42) }]}
            numberOfLines={2}
          >
            {nome}
          </Text>

          <Text style={[styles.papel, { fontSize: fonte(17) }]}>
            Administrador
          </Text>
        </View>

        <View style={styles.conteudo}>
          <View style={styles.cartao}>
            <TouchableOpacity
              style={styles.linha}
              onPress={abrirConta}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Abrir as informações da conta"
            >
              <CircleUserRound size={30} color={tema.texto} strokeWidth={2} />
              <Text
                style={[styles.textoLinha, { color: tema.texto, fontSize: fonte(19) }]}
              >
                Informações da Conta
              </Text>
              <ChevronRight size={28} color={tema.textoSecundario} />
            </TouchableOpacity>
          </View>

          <View style={styles.cartao}>
            <Text
              style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(21) }]}
            >
              Opções Avançadas
            </Text>

            <TouchableOpacity
              style={styles.linha}
              onPress={() => router.push("/admin/permissoes" as never)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Administrar permissões"
            >
              <UserCog size={30} color={tema.texto} strokeWidth={2} />
              <Text
                style={[styles.textoLinha, { color: tema.texto, fontSize: fonte(19) }]}
              >
                Administrar permissões
              </Text>
              <ChevronRight size={28} color={tema.textoSecundario} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linha}
              onPress={() => router.push("/admin/gerenciar-unidades" as never)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar unidades"
            >
              <Library size={30} color={tema.texto} strokeWidth={2} />
              <Text
                style={[styles.textoLinha, { color: tema.texto, fontSize: fonte(19) }]}
              >
                Gerenciar unidades
              </Text>
              <ChevronRight size={28} color={tema.textoSecundario} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linha}
              onPress={() => router.push("/admin/licoes" as never)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar lições"
            >
              <ClipboardList size={30} color={tema.texto} strokeWidth={2} />
              <Text
                style={[styles.textoLinha, { color: tema.texto, fontSize: fonte(19) }]}
              >
                Gerenciar lições
              </Text>
              <ChevronRight size={28} color={tema.textoSecundario} />
            </TouchableOpacity>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.botaoSair,
              { backgroundColor: tema.roxo, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={confirmarSaida}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <LogOut size={34} color="#303030" strokeWidth={2.4} />
            <Text style={[styles.textoSair, { fontSize: fonte(30) }]}>Sair</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BarraAdministrador
        onAdicionar={() => router.push("/admin/unidades" as never)}
      />

      <ModalConfirmacaoAdmin
        visivel={confirmandoSaida}
        titulo="Tem certeza?"
        mensagem="Deseja mesmo sair da sua conta?"
        textoConfirmar="Sair"
        aoCancelar={() => setConfirmandoSaida(false)}
        aoConfirmar={() => void sair()}
      />
    </View>
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
  faixaPerfil: {
    alignItems: "center",
    paddingBottom: 28,
    gap: 10,
  },
  areaAvatar: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },
  lapis: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
  },
  nome: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  papel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#303030",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 18,
  },
  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E9E3ED",
    paddingHorizontal: 20,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  tituloSecao: {
    fontFamily: "Poppins_800ExtraBold",
    marginTop: 22,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
  },
  textoLinha: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  botaoSair: {
    minHeight: 84,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  textoSair: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    flexShrink: 1,
  },
});
