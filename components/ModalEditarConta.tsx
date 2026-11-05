import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { mascaraTelefone } from "@/lib/conta";

export type CampoEdicao = "nome" | "telefone" | "email" | "senha";

type DefCampo = {
  chave: string;
  rotulo: string;
  secure?: boolean;
  teclado?: "default" | "email-address" | "phone-pad";
};

const DEFINICOES: Record<CampoEdicao, { titulo: string; campos: DefCampo[] }> = {
  nome: { titulo: "Alterar nome", campos: [{ chave: "valor", rotulo: "Nome completo" }] },
  telefone: {
    titulo: "Alterar telefone",
    campos: [{ chave: "valor", rotulo: "Telefone com DDD", teclado: "phone-pad" }],
  },
  email: {
    titulo: "Alterar e-mail",
    campos: [{ chave: "valor", rotulo: "Novo e-mail", teclado: "email-address" }],
  },
  senha: {
    titulo: "Alterar senha",
    campos: [
      { chave: "atual", rotulo: "Senha atual", secure: true },
      { chave: "nova", rotulo: "Nova senha", secure: true },
      { chave: "confirmacao", rotulo: "Confirmar nova senha", secure: true },
    ],
  },
};

type Props = {
  campo: CampoEdicao | null;
  valorAtual: string;
  aoFechar: () => void;
  /** Retorna uma mensagem de erro, ou null se salvou com sucesso. */
  aoSalvar: (campo: CampoEdicao, valores: Record<string, string>) => Promise<string | null>;
};

export function ModalEditarConta({ campo, valorAtual, aoFechar, aoSalvar }: Props) {
  const { tema, fonte } = useAcessibilidade();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setErro(null);
    setSalvando(false);
    setValores(campo && campo !== "senha" ? { valor: valorAtual } : {});
  }, [campo, valorAtual]);

  if (!campo) return null;
  const def = DEFINICOES[campo];

  const salvar = async () => {
    setErro(null);
    setSalvando(true);
    const resultado = await aoSalvar(campo, valores);
    setSalvando(false);
    if (resultado) setErro(resultado);
    else aoFechar();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={aoFechar}>
      <KeyboardAvoidingView
        style={estilos.fundo}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[estilos.caixa, { backgroundColor: tema.cartao }]}>
          <Text style={[estilos.titulo, { color: tema.texto, fontSize: fonte(20) }]}>
            {def.titulo}
          </Text>

          {def.campos.map((c) => (
            <View key={c.chave} style={estilos.grupo}>
              <Text style={[estilos.rotulo, { color: tema.textoSecundario, fontSize: fonte(13) }]}>
                {c.rotulo}
              </Text>
              <TextInput
                value={valores[c.chave] ?? ""}
                onChangeText={(t) =>
                  setValores((v) => ({
                    ...v,
                    [c.chave]: campo === "telefone" ? mascaraTelefone(t) : t,
                  }))
                }
                maxLength={campo === "telefone" ? 15 : undefined}
                secureTextEntry={c.secure}
                keyboardType={c.teclado ?? "default"}
                autoCapitalize={c.teclado === "email-address" || c.secure ? "none" : "words"}
                autoCorrect={false}
                style={[
                  estilos.input,
                  { color: tema.texto, borderColor: tema.borda, fontSize: fonte(16) },
                ]}
              />
            </View>
          ))}

          {erro ? <Text style={[estilos.erro, { fontSize: fonte(13) }]}>{erro}</Text> : null}

          <View style={estilos.botoes}>
            <Pressable
              style={[estilos.botao, { borderColor: tema.borda, borderWidth: 1 }]}
              onPress={aoFechar}
              disabled={salvando}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={[estilos.textoBotao, { color: tema.texto, fontSize: fonte(16) }]}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={[estilos.botao, { backgroundColor: tema.roxo, opacity: salvando ? 0.7 : 1 }]}
              onPress={salvar}
              disabled={salvando}
              accessibilityRole="button"
              accessibilityLabel="Salvar"
            >
              {salvando ? (
                <ActivityIndicator color="#303030" />
              ) : (
                <Text style={[estilos.textoBotao, { color: "#303030", fontSize: fonte(16) }]}>
                  Salvar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  caixa: { borderRadius: 24, padding: 20 },
  titulo: { fontFamily: "Poppins_900Black", marginBottom: 12 },
  grupo: { marginBottom: 12 },
  rotulo: { fontFamily: "Poppins_600SemiBold", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    fontFamily: "Poppins_600SemiBold",
  },
  erro: { color: "#C62828", fontFamily: "Poppins_600SemiBold", marginBottom: 8 },
  botoes: { flexDirection: "row", gap: 12, marginTop: 8 },
  botao: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotao: { fontFamily: "Poppins_900Black" },
});