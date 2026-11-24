import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, AlertTriangle, Check } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const GRADIENTE = ["#F3A6B8", "#FFD36E", "#C77DFF"] as const;

type PropsConfirmado = {
  visivel: boolean;
  titulo?: string;
  mensagem: string;
  textoBotao?: string;
  variante?: "sucesso" | "aviso";
  aoFechar: () => void;
};

/**
 * Pop-up de confirmação/feedback do administrador no estilo do app (substitui
 * os Alert.alert/window.alert após criar, editar, remover ou avisar).
 */
export function ModalConfirmadoAdmin({
  visivel,
  titulo = "Confirmado!",
  mensagem,
  textoBotao = "OK",
  variante = "sucesso",
  aoFechar,
}: PropsConfirmado) {
  const { tema, fonte } = useAcessibilidade();
  const sucesso = variante === "sucesso";

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <View style={styles.fundo}>
        <View
          style={[
            styles.cartao,
            { backgroundColor: tema.cartao, borderColor: tema.borda },
          ]}
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
        >
          <View
            style={[
              styles.selo,
              {
                backgroundColor: sucesso ? "#E7F7E5" : "#FFF3D6",
                borderColor: sucesso ? "#52AE32" : "#E5A100",
              },
            ]}
          >
            {sucesso ? (
              <Check size={32} color="#3D9B35" strokeWidth={3} />
            ) : (
              <AlertCircle size={32} color="#B77900" strokeWidth={2.6} />
            )}
          </View>

          <Text style={[styles.titulo, { color: tema.texto, fontSize: fonte(24) }]}>
            {titulo}
          </Text>

          <Text
            style={[
              styles.mensagem,
              { color: tema.textoSecundario, fontSize: fonte(16) },
            ]}
          >
            {mensagem}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.botaoGradienteWrap,
              pressed && styles.pressionado,
            ]}
            onPress={aoFechar}
            accessibilityRole="button"
            accessibilityLabel={textoBotao}
          >
            <LinearGradient
              colors={GRADIENTE}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.botaoGradiente}
            >
              <Text style={[styles.textoBotaoEscuro, { fontSize: fonte(18) }]}>
                {textoBotao}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type PropsConfirmacao = {
  visivel: boolean;
  titulo?: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  carregando?: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
};

/**
 * Pop-up "Tem certeza?" no estilo do app para ações de apagar/remover/sair.
 */
export function ModalConfirmacaoAdmin({
  visivel,
  titulo = "Tem certeza?",
  mensagem,
  textoConfirmar = "Apagar",
  textoCancelar = "Cancelar",
  carregando = false,
  aoCancelar,
  aoConfirmar,
}: PropsConfirmacao) {
  const { tema, fonte } = useAcessibilidade();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={carregando ? undefined : aoCancelar}
    >
      <View style={styles.fundo}>
        <View
          style={[
            styles.cartao,
            { backgroundColor: tema.cartao, borderColor: tema.borda },
          ]}
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
        >
          <View
            style={[
              styles.selo,
              { backgroundColor: "#FDECEB", borderColor: "#E23A2E" },
            ]}
          >
            <AlertTriangle size={30} color="#E23A2E" strokeWidth={2.5} />
          </View>

          <Text style={[styles.titulo, { color: tema.texto, fontSize: fonte(24) }]}>
            {titulo}
          </Text>

          <Text
            style={[
              styles.mensagem,
              { color: tema.textoSecundario, fontSize: fonte(16) },
            ]}
          >
            {mensagem}
          </Text>

          <View style={styles.linhaBotoes}>
            <Pressable
              style={({ pressed }) => [
                styles.botaoSecundario,
                { borderColor: tema.borda },
                pressed && styles.pressionado,
              ]}
              onPress={aoCancelar}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityLabel={textoCancelar}
            >
              <Text
                style={[
                  styles.textoBotaoSecundario,
                  { color: tema.texto, fontSize: fonte(16) },
                ]}
              >
                {textoCancelar}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.botaoPerigo,
                pressed && styles.pressionado,
              ]}
              onPress={aoConfirmar}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityLabel={textoConfirmar}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.textoBotaoClaro, { fontSize: fonte(16) }]}>
                  {textoConfirmar}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(26, 5, 36, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cartao: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#1A0524",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  selo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  titulo: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
    marginBottom: 8,
  },
  mensagem: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: 22,
  },
  botaoGradienteWrap: {
    width: "100%",
    borderRadius: 18,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoGradiente: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  textoBotaoEscuro: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
  linhaBotoes: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  botaoSecundario: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#F3F0F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  textoBotaoSecundario: {
    fontFamily: "Poppins_800ExtraBold",
  },
  botaoPerigo: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#E23A2E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    shadowColor: "#E23A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  textoBotaoClaro: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#FFFFFF",
  },
  pressionado: {
    opacity: 0.88,
  },
});
