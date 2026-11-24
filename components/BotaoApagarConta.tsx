import { useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import {
  ModalConfirmacaoAdmin,
  ModalConfirmadoAdmin,
} from "@/components/ModalAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { supabase } from "@/lib/supabase";

const VERMELHO = "#C62828";

export function BotaoApagarConta() {
  const router = useRouter();
  const { fonte } = useAcessibilidade();
  const [apagando, setApagando] = useState(false);
  const [etapaConfirmacao, setEtapaConfirmacao] = useState<0 | 1 | 2>(0);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const apagar = useCallback(async () => {
    setEtapaConfirmacao(0);
    setApagando(true);
    const { error } = await supabase.rpc("apagar_minha_conta");

    if (error) {
      setApagando(false);
      setErroModal("Não foi possível apagar sua conta agora. Tente novamente em instantes.");
      return;
    }

    // O login já foi removido no servidor; limpa a sessão local.
    await supabase.auth.signOut().catch(() => undefined);
    router.replace("/auth/login/contas" as never);
  }, [router]);

  const confirmar = useCallback(() => {
    setEtapaConfirmacao(1);
  }, []);

  return (
    <>
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

      <ModalConfirmacaoAdmin
        visivel={etapaConfirmacao === 1}
        titulo="Apagar conta?"
        mensagem="Essa ação é permanente. Seu perfil, progresso, XP e conquistas serão apagados e não poderão ser recuperados."
        textoConfirmar="Continuar"
        aoCancelar={() => setEtapaConfirmacao(0)}
        aoConfirmar={() => setEtapaConfirmacao(2)}
      />

      <ModalConfirmacaoAdmin
        visivel={etapaConfirmacao === 2}
        titulo="Tem certeza absoluta?"
        mensagem="Não será possível desfazer depois que você apagar sua conta."
        textoConfirmar="Apagar minha conta"
        carregando={apagando}
        aoCancelar={() => setEtapaConfirmacao(0)}
        aoConfirmar={() => void apagar()}
      />

      <ModalConfirmadoAdmin
        visivel={erroModal !== null}
        titulo="Não foi possível apagar"
        mensagem={erroModal ?? ""}
        variante="aviso"
        aoFechar={() => setErroModal(null)}
      />
    </>
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