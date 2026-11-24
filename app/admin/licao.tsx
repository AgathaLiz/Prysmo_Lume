import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

/**
 * Criação de lição do administrador (só o quiz, ainda sem mockup). Por enquanto
 * é só o título e o caminho de volta, para o "+" da barra não levar a lugar
 * nenhum.
 */
export default function TelaAdminLicao() {
  const router = useRouter();
  const { tema, fonte } = useAcessibilidade();

  return (
    <SafeAreaView style={styles.tela} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        <BotaoVoltar onPress={() => router.back()} />

        <Text style={[styles.titulo, { color: tema.texto, fontSize: fonte(26) }]}>
          Adicionar lição
        </Text>

        <Text style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(16) }]}>
          Esta tela ainda está sendo montada.
        </Text>
      </ScrollView>
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
    paddingTop: 16,
    gap: 12,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
  },
  texto: {
    fontFamily: "Poppins_600SemiBold",
  },
});
