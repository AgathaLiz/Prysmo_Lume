import { Bell, Globe2, Volume1, Vibrate } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

export default function TelaConfiguracoes() {
  const insets = useSafeAreaInsets();
  const { tema, modoEscuro, fonte } = useAcessibilidade();
  const [notificacoes, setNotificacoes] = useState(true);
  const [sons, setSons] = useState(true);
  const [vibracao, setVibracao] = useState(true);

  const fundo = modoEscuro ? tema.fundo : "#F8F4FC";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;
  const borda = modoEscuro ? tema.borda : "#DFC3F5";

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: fundo }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: 124 + insets.bottom },
        ]}
      >
        <BotaoVoltar />

        <Text style={[styles.titulo, { color: texto, fontSize: fonte(28) }]}>
          Configurações Gerais
        </Text>
        <Text style={[styles.subtitulo, { color: secundario, fontSize: fonte(14) }]}>
          Ajustes rápidos do aplicativo
        </Text>

        <View style={[styles.cartao, { backgroundColor: cartao, borderColor: borda }]}>
          <LinhaConfig
            icone={<Bell size={22} color={texto} />}
            titulo="Notificações"
            descricao="Lembretes das lições"
            valor={notificacoes}
            onValueChange={setNotificacoes}
          />
          <LinhaConfig
            icone={<Volume1 size={22} color={texto} />}
            titulo="Sons do app"
            descricao="Efeitos ao acertar"
            valor={sons}
            onValueChange={setSons}
          />
          <LinhaConfig
            icone={<Vibrate size={22} color={texto} />}
            titulo="Vibração"
            descricao="Resposta ao tocar"
            valor={vibracao}
            onValueChange={setVibracao}
            ultima
          />
        </View>

        <View style={[styles.cartao, { backgroundColor: cartao, borderColor: borda }]}>
          <View style={styles.linhaIdioma}>
            <View style={[styles.circuloIcone, { backgroundColor: tema.cartaoSuave }]}>
              <Globe2 size={22} color={texto} />
            </View>
            <View style={styles.textoLinha}>
              <Text style={[styles.tituloLinha, { color: texto, fontSize: fonte(16) }]}>
                Idioma
              </Text>
              <Text style={[styles.descricaoLinha, { color: secundario, fontSize: fonte(12) }]}>
                Português (Brasil)
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.rodape, { color: secundario, fontSize: fonte(12) }]}>
          As preferências de notificações e sons são aplicadas neste aparelho.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinhaConfig({
  icone,
  titulo,
  descricao,
  valor,
  onValueChange,
  ultima = false,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
  valor: boolean;
  onValueChange: (valor: boolean) => void;
  ultima?: boolean;
}) {
  const { tema, fonte } = useAcessibilidade();
  return (
    <View
      style={[
        styles.linhaConfig,
        !ultima && { borderBottomWidth: 1, borderBottomColor: tema.borda },
      ]}
    >
      <View style={[styles.circuloIcone, { backgroundColor: tema.cartaoSuave }]}>
        {icone}
      </View>
      <View style={styles.textoLinha}>
        <Text style={[styles.tituloLinha, { color: tema.texto, fontSize: fonte(16) }]}>
          {titulo}
        </Text>
        <Text style={[styles.descricaoLinha, { color: tema.textoSecundario, fontSize: fonte(12) }]}>
          {descricao}
        </Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onValueChange}
        trackColor={{ false: "#D8D2DC", true: tema.roxoEscuro }}
        thumbColor="#FFFFFF"
        accessibilityLabel={titulo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  titulo: {
    fontFamily: "Poppins_900Black",
    marginTop: 4,
  },
  subtitulo: {
    fontFamily: "Poppins_300Light",
    marginTop: 2,
    marginBottom: 14,
  },
  cartao: {
    marginTop: 12,
    borderRadius: 26,
    borderWidth: 3,
    paddingHorizontal: 16,
  },
  linhaConfig: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    gap: 12,
  },
  circuloIcone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  textoLinha: {
    flex: 1,
  },
  tituloLinha: {
    fontFamily: "Poppins_600SemiBold",
  },
  descricaoLinha: {
    fontFamily: "Poppins_300Light",
    marginTop: 1,
  },
  linhaIdioma: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 76,
    gap: 12,
  },
  rodape: {
    fontFamily: "Poppins_300Light",
    textAlign: "center",
    marginTop: 14,
  },
});
