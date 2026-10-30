import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FundoAmarelo } from "@/components/FundoAmarelo";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { carregarPainel, type DadosPainel } from "@/lib/painel";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function chaveData(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(
    2,
    "0"
  )}`;
}

export default function TelaOpcoes() {
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

  const hoje = useMemo(() => new Date(), []);
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasAtivos = new Set(dados?.datasAtivas ?? []);

  const celulas = useMemo(() => {
    const vazios = Array.from({ length: primeiroDiaSemana }, () => null);
    const dias = Array.from({ length: totalDias }, (_, indice) => indice + 1);
    return [...vazios, ...dias];
  }, [primeiroDiaSemana, totalDias]);

  const xp = dados?.xp ?? 0;
  const nivel = dados?.nivel ?? Math.floor(xp / 50) + 1;
  const xpNoNivel = xp % 50;
  const progressoNivel = Math.max(0.04, Math.min(1, xpNoNivel / 50));
  const diasFazendo = dados?.diasAtivos || 2;

  const fundo = modoEscuro ? tema.fundo : "#FFFFFF";
  const cartao = tema.cartao;
  const texto = tema.texto;
  const secundario = tema.textoSecundario;

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
        <View
          style={[
            styles.cartaoNivel,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <View style={styles.linhaNivel}>
            <Text style={[styles.nivel, { color: texto, fontSize: fonte(24) }]}>
              Nível {nivel}
            </Text>
            <View style={styles.ligacaoNivel}>
              <View style={[styles.linhaLigacao, { backgroundColor: texto }]} />
              <ArrowRight size={24} color={texto} strokeWidth={2.4} />
            </View>
            <Text style={[styles.nivel, { color: texto, fontSize: fonte(24) }]}>
              Nível {nivel + 1}
            </Text>
          </View>

          <View style={styles.linhaProgresso}>
            <View style={styles.seloXp}>
              <Text style={[styles.textoSeloXp, { fontSize: fonte(14) }]}>XP</Text>
            </View>
            <View style={[styles.barraFundo, { backgroundColor: tema.cartaoSuave }]}>
              <LinearGradient
                colors={["#D987FF", "#F3A6B8", "#FFD651"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barraPreenchida, { width: `${progressoNivel * 100}%` }]}
              />
              <Text style={[styles.textoBarra, { color: texto, fontSize: fonte(12) }]}>
                {xpNoNivel}/50
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.linhaEstatisticas}>
          <CartaoEstatistica
            numero={diasFazendo}
            legenda="Dias fazendo lições"
            corCartao={cartao}
            corTexto={texto}
            corSecundaria={secundario}
            sombra={modoEscuro ? "#000" : "#7A4A00"}
          />
          <CartaoEstatistica
            numero={dados?.licoesConcluidas ?? 0}
            legenda="Lições concluídas"
            corCartao={cartao}
            corTexto={texto}
            corSecundaria={secundario}
            sombra={modoEscuro ? "#000" : "#7A4A00"}
          />
          <CartaoEstatistica
            numero={`${dados?.acertos ?? 0}%`}
            legenda="Acertos em atividades"
            corCartao={cartao}
            corTexto={texto}
            corSecundaria={secundario}
            sombra={modoEscuro ? "#000" : "#7A4A00"}
          />
        </View>

        <View
          style={[
            styles.cartaoCalendario,
            { backgroundColor: cartao, shadowColor: modoEscuro ? "#000" : "#7A4A00" },
          ]}
        >
          <View style={styles.cabecalhoCalendario}>
            <Text style={[styles.nomeMes, { color: texto, fontSize: fonte(24) }]}>
              {MESES[mes]}
            </Text>
            <Text style={[styles.ano, { color: secundario, fontSize: fonte(16) }]}>
              {ano}
            </Text>
          </View>

          <View style={[styles.linhaDivisoria, { backgroundColor: texto }]} />

          <View style={styles.gradeCalendario}>
            {celulas.map((dia, indice) => {
              if (dia === null) {
                return <View key={`vazio-${indice}`} style={styles.celula} />;
              }

              const chave = chaveData(ano, mes, dia);
              const ativo = diasAtivos.has(chave);

              return (
                <View key={chave} style={styles.celula}>
                  {ativo ? (
                    <LinearGradient
                      colors={["#C77DFF", "#F3A6B8", "#FFD36E"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.diaCalendario, styles.diaAtivo]}
                    >
                      <Text style={[styles.numeroDiaAtivo, { fontSize: fonte(12) }]}>
                        {String(dia).padStart(2, "0")}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.diaCalendario,
                        {
                          backgroundColor: modoEscuro ? "#3D2A46" : "#E8E4EA",
                        },
                      ]}
                    >
                      <Text style={[styles.numeroDia, { color: texto, fontSize: fonte(12) }]}>
                        {String(dia).padStart(2, "0")}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CartaoEstatistica({
  numero,
  legenda,
  corCartao,
  corTexto,
  corSecundaria,
  sombra,
}: {
  numero: string | number;
  legenda: string;
  corCartao: string;
  corTexto: string;
  corSecundaria: string;
  sombra: string;
}) {
  const { fonte } = useAcessibilidade();
  return (
    <View
      style={[
        styles.cartaoEstatistica,
        { backgroundColor: corCartao, shadowColor: sombra },
      ]}
    >
      <Text style={[styles.numeroEstatistica, { color: corTexto, fontSize: fonte(30) }]}>
        {numero}
      </Text>
      <Text style={[styles.legendaEstatistica, { color: corSecundaria, fontSize: fonte(11) }]}>
        {legenda}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  cartaoNivel: {
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  linhaNivel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ligacaoNivel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  linhaLigacao: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  linhaProgresso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  seloXp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2B2730",
    borderWidth: 2,
    borderColor: "#1C1A1F",
    alignItems: "center",
    justifyContent: "center",
  },
  textoSeloXp: {
    fontFamily: "Poppins_900Black",
    color: "#FFFFFF",
  },
  nivel: {
    fontFamily: "Poppins_900Black",
  },
  barraFundo: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    justifyContent: "center",
  },
  barraPreenchida: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 17,
  },
  textoBarra: {
    alignSelf: "center",
    fontFamily: "Poppins_900Black",
    color: "#2C1038",
  },
  linhaEstatisticas: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cartaoEstatistica: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  numeroEstatistica: {
    fontFamily: "Poppins_900Black",
    textAlign: "center",
  },
  legendaEstatistica: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
  cartaoCalendario: {
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  cabecalhoCalendario: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nomeMes: {
    fontFamily: "Poppins_900Black",
  },
  ano: {
    fontFamily: "Poppins_600SemiBold",
  },
  linhaDivisoria: {
    height: 14,
    borderRadius: 7,
    marginTop: 12,
    marginBottom: 14,
  },
  gradeCalendario: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  celula: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  diaCalendario: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  diaAtivo: {
    borderWidth: 2,
    borderColor: "#2B2730",
  },
  numeroDia: {
    fontFamily: "Poppins_600SemiBold",
  },
  numeroDiaAtivo: {
    fontFamily: "Poppins_900Black",
    color: "#2C1038",
  },
});
