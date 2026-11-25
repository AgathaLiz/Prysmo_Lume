import { Check, ChevronDown, ChevronUp, Volume2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BotaoGrande } from "@/components/BotaoGrande";
import { TutorialMimi } from "@/components/TutorialMimi";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import {
  RESUMO_TERMOS,
  TERMOS_ATUALIZACAO,
  TERMOS_COMPLETOS,
  URL_POLITICA_PRIVACIDADE,
} from "@/lib/termos";

type Props = {
  visivel: boolean;
  salvando: boolean;
  erro: string;
  onAceitar: () => void;
  onRecusar: () => void;
};

export function ModalTermos({
  visivel,
  salvando,
  erro,
  onAceitar,
  onRecusar,
}: Props) {
  const { tema, fonte, falar, pararFala } = useAcessibilidade();
  const [concordo, setConcordo] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  useEffect(() => {
    if (!visivel) {
      setConcordo(false);
      setAmpliado(false);
      pararFala();
    }
  }, [visivel, pararFala]);

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      // Sem fechar pelo botão voltar: é preciso aceitar ou recusar.
      onRequestClose={() => {}}
    >
      <SafeAreaView style={[styles.tela, { backgroundColor: tema.fundo }]}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
        >
          <TutorialMimi
            fala="Antes de começar, vamos combinar algumas regras. Leia com calma. Se quiser, toque em Ouvir."
            pose="frente"
            pequeno
          />

          <Text style={[styles.titulo, { color: tema.texto, fontSize: fonte(26) }]}>
            Termos e Condições de Uso
          </Text>

          <Text
            style={[styles.texto, { color: tema.textoSecundario, fontSize: fonte(16) }]}
          >
            Resumo em linguagem simples. Última atualização: {TERMOS_ATUALIZACAO}
          </Text>

          <View
            style={[
              styles.cartao,
              { backgroundColor: tema.cartao, borderColor: tema.borda },
            ]}
          >
            {RESUMO_TERMOS.map((item) => (
              <View key={item} style={styles.linhaItem}>
                <View style={[styles.bolinha, { backgroundColor: tema.roxoEscuro }]} />
                <Text
                  style={[styles.textoItem, { color: tema.texto, fontSize: fonte(18) }]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <BotaoGrande
            titulo="Ouvir o resumo"
            variante="contorno"
            icone={<Volume2 size={22} color={tema.texto} />}
            onPress={() => falar(RESUMO_TERMOS.join(" "))}
          />

          <TouchableOpacity
            onPress={() => setAmpliado((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: ampliado }}
            accessibilityLabel={
              ampliado ? "Esconder os termos completos" : "Ler os termos completos"
            }
            style={[styles.botaoAmpliar, { borderColor: tema.borda }]}
          >
            <Text
              style={[styles.textoAmpliar, { color: tema.roxoEscuro, fontSize: fonte(18) }]}
            >
              {ampliado ? "Esconder os termos completos" : "Ler os termos completos"}
            </Text>
            {ampliado ? (
              <ChevronUp size={24} color={tema.roxoEscuro} />
            ) : (
              <ChevronDown size={24} color={tema.roxoEscuro} />
            )}
          </TouchableOpacity>

          {ampliado && (
            <View
              style={[
                styles.cartao,
                { backgroundColor: tema.cartao, borderColor: tema.borda },
              ]}
            >
              {TERMOS_COMPLETOS.map((secao) => (
                <View key={secao.titulo} style={styles.secao}>
                  <Text
                    style={[styles.tituloSecao, { color: tema.texto, fontSize: fonte(19) }]}
                  >
                    {secao.titulo}
                  </Text>
                  {secao.paragrafos.map((paragrafo, indice) => (
                    <Text
                      key={`${secao.titulo}-${indice}`}
                      style={[
                        styles.texto,
                        { color: tema.textoSecundario, fontSize: fonte(16), lineHeight: fonte(24) },
                      ]}
                    >
                      {paragrafo}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {URL_POLITICA_PRIVACIDADE !== "https://docs.google.com/document/d/1OHQz4ESJb4CUtC8CongQq0Sok2cLrzYSe4HiEPj4dQ8/preview" && (
            <TouchableOpacity
              onPress={() => void Linking.openURL(URL_POLITICA_PRIVACIDADE)}
              accessibilityRole="link"
            >
              <Text
                style={[styles.link, { color: tema.roxoEscuro, fontSize: fonte(17) }]}
              >
                Ler a Política de Privacidade
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setConcordo((v) => !v)}
            disabled={salvando}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: concordo, disabled: salvando }}
            accessibilityLabel="Li e concordo com os Termos e Condições de Uso e com a Política de Privacidade"
            style={[
              styles.linhaCheck,
              {
                backgroundColor: tema.cartao,
                borderColor: concordo ? tema.roxoEscuro : tema.borda,
                borderWidth: concordo ? 3 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.caixa,
                {
                  borderColor: tema.roxoEscuro,
                  backgroundColor: concordo ? tema.roxoEscuro : "transparent",
                },
              ]}
            >
              {concordo && <Check size={20} color="#FFFFFF" />}
            </View>
            <Text
              style={[styles.textoCheck, { color: tema.texto, fontSize: fonte(17) }]}
            >
              Li e concordo com os Termos e a Política de Privacidade. Se tenho menos
              de 18 anos, um responsável concorda comigo.
            </Text>
          </TouchableOpacity>

          {erro !== "" && (
            <Text
              style={[styles.erro, { color: tema.erro, fontSize: fonte(16) }]}
              accessibilityLiveRegion="polite"
            >
              {erro}
            </Text>
          )}

          <BotaoGrande
            titulo={salvando ? "Salvando..." : "Aceitar e continuar"}
            variante="roxo"
            carregando={salvando}
            desabilitado={!concordo || salvando}
            onPress={onAceitar}
          />

          <BotaoGrande
            titulo="Não aceito"
            variante="contorno"
            desabilitado={salvando}
            onPress={onRecusar}
          />

          <Text
            style={[styles.texto, styles.centralizado, { color: tema.textoSecundario, fontSize: fonte(14) }]}
          >
            Sem aceitar, não é possível usar o Lume.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 18, paddingBottom: 32, gap: 14 },
  titulo: { fontFamily: "Poppins_800ExtraBold" },
  texto: { fontFamily: "Poppins_300Light" },
  centralizado: { textAlign: "center" },
  cartao: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  linhaItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bolinha: { width: 10, height: 10, borderRadius: 5, marginTop: 9 },
  textoItem: { flex: 1, fontFamily: "Poppins_600SemiBold" },
  botaoAmpliar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  textoAmpliar: { fontFamily: "Poppins_800ExtraBold", flex: 1 },
  secao: { gap: 6 },
  tituloSecao: { fontFamily: "Poppins_800ExtraBold" },
  link: { fontFamily: "Poppins_600SemiBold", textDecorationLine: "underline" },
  linhaCheck: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    minHeight: 64,
  },
  caixa: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCheck: { flex: 1, fontFamily: "Poppins_600SemiBold" },
  erro: { fontFamily: "Poppins_600SemiBold", textAlign: "center" },
});