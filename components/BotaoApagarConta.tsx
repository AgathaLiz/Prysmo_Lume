import { useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text } from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { supabase } from "@/lib/supabase";

const VERMELHO = "#C62828";

function avisar(titulo: string, mensagem: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

export function BotaoApagarConta() {
  const router = useRouter();
  const { fonte } = useAcessibilidade();
  const [apagando, setApagando] = useState(false);

  const apagar = useCallback(async () => {
    setApagando(true);
    const { error } = await supabase.rpc("apagar_minha_conta");

    if (error) {
      setApagando(false);
      avisar("Não foi possível apagar", "Tente novamente em instantes.");
      return;
    }

    // O login já foi removido no servidor; limpa a sessão local.
    await supabase.auth.signOut().catch(() => undefined);
    router.replace("/auth/login/contas" as never);
  }, [router]);

  const confirmar = useCallback(() => {
    const mensagem =
      "Essa ação é permanente. Seu perfil, progresso, XP e conquistas serão apagados e não poderão ser recuperados.";

    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm(`Apagar conta?\n\n${mensagem}`) &&
        window.confirm("Tem certeza absoluta? Não dá para desfazer.")
      ) {
        void apagar();
      }
      return;
    }

    Alert.alert("Apagar conta", mensagem, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        onPress: () =>
          Alert.alert("Tem certeza absoluta?", "Não dá para desfazer.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Apagar minha conta", style: "destructive", onPress: () => void apagar() },
          ]),
      },
    ]);
  }, [apagar]);

  return (
    <Pressable
      style={({ pressed }) => [estilos.botao, { opacity: pressed || apagando ? 0.7 : 1 }]}
      onPress={confirmar}
      disabled={apagando}
      accessibilityRole="button"
      accessibilityLabel="Apagar conta"
    >
      {apagando ? (
        <ActivityIndicator color={VERMELHO} />
      ) : (
        <>
          <Trash2 size={22} color={VERMELHO} strokeWidth={2.2} />
          <Text style={[estilos.texto, { fontSize: fonte(16) }]}>Apagar Conta</Text>
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    marginTop: 24,
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: VERMELHO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  texto: { fontFamily: "Poppins_600SemiBold", color: VERMELHO },
});