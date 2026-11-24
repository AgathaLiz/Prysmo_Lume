import { LinearGradient } from "expo-linear-gradient";
import {
  Check,
  ChevronDown,
  CirclePlus,
  MapPin,
  Pencil,
  Skull,
  Star,
  Tag,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarraAdministrador } from "@/components/BarraNavegacao";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { FundoAdminPerfil } from "@/components/FundoAdmin";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import { listarLicoes, nomeDaLicao, type LicaoAdmin } from "@/lib/licoes-admin";
import type { DadosUnidade } from "@/lib/unidades";

/** As dificuldades que a unidade pode ter. */
const DIFICULDADES = ["Fácil", "Média", "Difícil"];

/** O degradê dos botões grandes (o mesmo do design). */
const GRADIENTE = ["#F3A6B8", "#FFD36E", "#C77DFF"] as const;

type ValoresUnidade = {
  nome: string;
  dificuldade: string | null;
  posicao: number | null;
  numeroLicoes: string;
  licoesIds: number[];
};

/** Os valores que a tela pode já mandar preenchidos (o número pode vir do banco). */
type ValoresIniciais = Omit<Partial<ValoresUnidade>, "numeroLicoes"> & {
  numeroLicoes?: string | number;
};

type Props = {
  /** "criar" (Tela 3) usa as duas colunas de Posição/Número; "editar" (Tela 5)
   *  empilha todos os campos, como no mockup. */
  modo: "criar" | "editar";
  titulo: string;
  subtitulo?: string;
  rotuloBotao: string;
  valoresIniciais?: ValoresIniciais;
  /** Quantas unidades já existem, para montar as opções de posição. */
  unidadesExistentes: number;
  salvando: boolean;
  onEnviar: (dados: DadosUnidade) => void;
  /** Para onde o "Voltar" leva (a tela de onde a pessoa veio). */
  onVoltar: () => void;
};

type Opcao = {
  valor: string | number;
  rotulo: string;
};

/** Campo do formulário: ícone, texto (ou valor escolhido) e o acessório. */
function Campo({
  Icone,
  rotulo,
  valor,
  aoTocar,
  aoMudar,
  editavel = false,
  numerico = false,
  proporcao,
  compacto = false,
}: {
  Icone: LucideIcon;
  rotulo: string;
  valor?: string;
  aoTocar?: () => void;
  aoMudar?: (texto: string) => void;
  editavel?: boolean;
  numerico?: boolean;
  /** Peso flexível quando dois campos dividem a mesma linha. */
  proporcao?: number;
  /** Campos lado a lado (Posição / Número) usam letra e espaços menores. */
  compacto?: boolean;
}) {
  const { tema, fonte } = useAcessibilidade();
  const entradaRef = useRef<TextInput>(null);
  const tamanho = compacto ? fonte(13) : fonte(16);
  const tamanhoIcone = compacto ? 18 : 20;
  const tamanhoAcessorio = compacto ? 16 : 20;

  const conteudo = (
    <>
      <Icone size={tamanhoIcone} color={tema.texto} strokeWidth={2.2} />

      {aoMudar ? (
        <TextInput
          ref={entradaRef}
          style={[styles.entrada, { color: tema.texto, fontSize: tamanho }]}
          value={valor}
          onChangeText={aoMudar}
          placeholder={rotulo}
          placeholderTextColor={tema.textoSecundario}
          keyboardType={numerico ? "number-pad" : "default"}
        />
      ) : (
        <Text
          style={[
            styles.valor,
            {
              color: valor ? tema.texto : tema.textoSecundario,
              fontSize: tamanho,
            },
          ]}
          numberOfLines={1}
        >
          {valor || rotulo}
        </Text>
      )}

      {editavel ? (
        <Pencil size={compacto ? 16 : 18} color={tema.texto} strokeWidth={2.2} />
      ) : (
        <ChevronDown size={tamanhoAcessorio} color={tema.texto} strokeWidth={2.4} />
      )}
    </>
  );

  const estiloCampo = [
    styles.campo,
    { borderColor: tema.borda },
    proporcao !== undefined ? { flex: proporcao } : null,
    compacto ? styles.campoCompacto : null,
  ];

  if (aoMudar) {
    return (
      <Pressable
        style={estiloCampo}
        onPress={() => entradaRef.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel={rotulo}
      >
        {conteudo}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={estiloCampo}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint="Abre as opções"
    >
      {conteudo}
    </Pressable>
  );
}

/** A caixinha de opções (usada nos campos de lista e no multiselect). */
function ModalOpcoes({
  visivel,
  titulo,
  opcoes,
  selecionados,
  multipla,
  aoFechar,
  aoEscolher,
  aoConfirmar,
}: {
  visivel: boolean;
  titulo: string;
  opcoes: Opcao[];
  selecionados: (string | number)[];
  multipla: boolean;
  aoFechar: () => void;
  aoEscolher: (valor: string | number) => void;
  aoConfirmar: (valores: (string | number)[]) => void;
}) {
  const { tema, fonte } = useAcessibilidade();
  const [escolhidos, setEscolhidos] = useState<(string | number)[]>(selecionados);

  useEffect(() => {
    if (visivel) setEscolhidos(selecionados);
  }, [visivel, selecionados]);

  const alternar = useCallback((valor: string | number) => {
    setEscolhidos((atual) =>
      atual.includes(valor) ? atual.filter((item) => item !== valor) : [...atual, valor]
    );
  }, []);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={styles.fundoModal}>
        <View style={[styles.caixaModal, { backgroundColor: tema.cartao }]}>
          <Text style={[styles.tituloModal, { color: tema.texto, fontSize: fonte(19) }]}>
            {titulo}
          </Text>

          <ScrollView style={styles.listaModal} showsVerticalScrollIndicator={false}>
            {opcoes.map((opcao) => {
              const marcado = escolhidos.includes(opcao.valor);

              return (
                <Pressable
                  key={String(opcao.valor)}
                  style={styles.opcao}
                  onPress={() => (multipla ? alternar(opcao.valor) : aoEscolher(opcao.valor))}
                  accessibilityRole={multipla ? "checkbox" : "button"}
                  accessibilityState={{ checked: marcado }}
                >
                  <Text
                    style={[
                      styles.textoOpcao,
                      {
                        color: marcado ? tema.roxoEscuro : tema.texto,
                        fontSize: fonte(16),
                      },
                    ]}
                  >
                    {opcao.rotulo}
                  </Text>

                  {marcado ? <Check size={20} color={tema.roxoEscuro} strokeWidth={2.6} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {multipla ? (
            <Pressable
              style={[styles.botaoModal, { backgroundColor: tema.roxo }]}
              onPress={() => aoConfirmar(escolhidos)}
              accessibilityRole="button"
            >
              <Text style={[styles.textoBotaoModal, { fontSize: fonte(17) }]}>Pronto</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.cancelarModal}
            onPress={aoFechar}
            accessibilityRole="button"
          >
            <Text style={[styles.textoCancelar, { color: tema.textoSecundario, fontSize: fonte(15) }]}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Formulário da unidade, usado nas telas "Criar Unidade" (Tela 3) e
 * "Editar Unidade" (Tela 5), como no mockup: faixa em degradê com o "Voltar" e
 * o título, os campos com ícone dentro de um cartão branco e o botão grande em
 * degradê no fim.
 */
export function FormularioUnidade({
  modo,
  titulo,
  subtitulo,
  rotuloBotao,
  valoresIniciais,
  unidadesExistentes,
  salvando,
  onEnviar,
  onVoltar,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: larguraJanela } = useWindowDimensions();
  const { tema, fonte } = useAcessibilidade();

  const [nome, setNome] = useState(valoresIniciais?.nome ?? "");
  const [dificuldade, setDificuldade] = useState<string | null>(
    valoresIniciais?.dificuldade ?? null
  );
  const [posicao, setPosicao] = useState<number | null>(valoresIniciais?.posicao ?? null);
  const [numeroLicoes, setNumeroLicoes] = useState(
    valoresIniciais?.numeroLicoes ? String(valoresIniciais.numeroLicoes) : ""
  );
  const [licoesIds, setLicoesIds] = useState<number[]>(valoresIniciais?.licoesIds ?? []);

  const [alturaFaixa, setAlturaFaixa] = useState(0);
  const [aberto, setAberto] = useState<"dificuldade" | "posicao" | "licoes" | null>(null);

  const [licoes, setLicoes] = useState<LicaoAdmin[]>([]);
  const [carregandoLicoes, setCarregandoLicoes] = useState(true);

  useEffect(() => {
    let ativo = true;

    listarLicoes().then((lista) => {
      if (!ativo) return;
      setLicoes(lista ?? []);
      setCarregandoLicoes(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const medirFaixa = useCallback((evento: LayoutChangeEvent) => {
    const altura = evento.nativeEvent.layout.height;
    setAlturaFaixa((atual) => (Math.abs(atual - altura) < 1 ? atual : altura));
  }, []);

  const opcoesDificuldade = useMemo<Opcao[]>(
    () => DIFICULDADES.map((item) => ({ valor: item, rotulo: item })),
    []
  );

  const opcoesPosicao = useMemo<Opcao[]>(() => {
    const total = Math.max(1, unidadesExistentes + 1);
    return Array.from({ length: total }, (_, indice) => ({
      valor: indice + 1,
      rotulo: `${indice + 1}º`,
    }));
  }, [unidadesExistentes]);

  const opcoesLicoes = useMemo<Opcao[]>(
    () => licoes.map((licao) => ({ valor: licao.id, rotulo: nomeDaLicao(licao.nome) })),
    [licoes]
  );

  const enviar = useCallback(() => {
    const numero = Number(numeroLicoes.replace(/\D/g, ""));

    onEnviar({
      nome: nome.trim(),
      dificuldade,
      posicao,
      numeroLicoes: Number.isFinite(numero) && numero > 0 ? numero : null,
      licoesIds,
    });
  }, [nome, dificuldade, posicao, numeroLicoes, licoesIds, onEnviar]);

  const podeEnviar = nome.trim().length > 0 && !salvando;
  // Em telas estreitas ou com fonte ampliada, empilha Posição e Número para
  // "Número de lições" não cortar.
  const ladoALado = modo === "criar" && larguraJanela >= 380 && fonte(13) <= 14.5;

  const campoPosicao = (
    <Campo
      Icone={MapPin}
      rotulo="Posição"
      valor={posicao === null ? undefined : `${posicao}º`}
      aoTocar={() => setAberto("posicao")}
      proporcao={ladoALado ? 0.85 : undefined}
      compacto={ladoALado}
    />
  );

  const campoNumero = (
    <Campo
      Icone={Star}
      rotulo="Número de lições"
      valor={numeroLicoes}
      aoMudar={setNumeroLicoes}
      numerico
      editavel={modo === "editar"}
      proporcao={ladoALado ? 1.35 : undefined}
      compacto={ladoALado}
    />
  );

  const campoLicoes = (
    <Campo
      Icone={CirclePlus}
      rotulo="Lições incluídas"
      valor={
        licoesIds.length > 0
          ? licoesIds.length === 1
            ? "1 lição incluída"
            : `${licoesIds.length} lições incluídas`
          : undefined
      }
      aoTocar={() => setAberto("licoes")}
    />
  );

  const campoDificuldade = (
    <Campo
      Icone={Skull}
      rotulo="Dificuldade"
      valor={dificuldade ?? undefined}
      aoTocar={() => setAberto("dificuldade")}
    />
  );

  return (
    <View style={styles.tela}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.rolagem, { paddingBottom: 170 + insets.bottom }]}
      >
        <View
          style={[styles.faixa, { paddingTop: insets.top + 8 }]}
          onLayout={medirFaixa}
        >
          {alturaFaixa > 0 ? <FundoAdminPerfil altura={alturaFaixa} /> : null}

          <BotaoVoltar cor={tema.texto} onPress={onVoltar} />

          <Text style={[styles.tituloFaixa, { fontSize: fonte(29) }]}>{titulo}</Text>

          {subtitulo ? (
            <Text style={[styles.subtituloFaixa, { fontSize: fonte(17) }]}>
              {subtitulo}
            </Text>
          ) : null}
        </View>

        <View style={styles.cartao}>
          <Campo
            Icone={Tag}
            rotulo="Nome da Unidade"
            valor={nome}
            aoMudar={setNome}
            editavel={modo === "editar"}
          />

          {modo === "criar" ? (
            <>
              {campoDificuldade}

              {ladoALado ? (
                <View style={styles.linhaDupla}>
                  {campoPosicao}
                  {campoNumero}
                </View>
              ) : (
                <>
                  {campoPosicao}
                  {campoNumero}
                </>
              )}
            </>
          ) : (
            <>
              {campoNumero}
              {campoPosicao}
            </>
          )}

          {campoLicoes}

          {modo === "editar" ? campoDificuldade : null}
        </View>

        <Pressable
          style={({ pressed }) => [styles.areaBotao, pressed && styles.areaBotaoPressionada]}
          onPress={enviar}
          disabled={!podeEnviar}
          accessibilityRole="button"
          accessibilityLabel={rotuloBotao}
          accessibilityState={{ disabled: !podeEnviar }}
        >
          <LinearGradient
            colors={GRADIENTE}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.botao}
          >
            {salvando ? (
              <ActivityIndicator color="#303030" />
            ) : (
              <Text style={[styles.textoBotao, { fontSize: fonte(27) }]}>{rotuloBotao}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <BarraAdministrador ativo="adicionar" onAdicionar={enviar} />

      <ModalOpcoes
        visivel={aberto === "dificuldade"}
        titulo="Dificuldade"
        opcoes={opcoesDificuldade}
        selecionados={dificuldade ? [dificuldade] : []}
        multipla={false}
        aoFechar={() => setAberto(null)}
        aoEscolher={(valor) => {
          setDificuldade(String(valor));
          setAberto(null);
        }}
        aoConfirmar={() => setAberto(null)}
      />

      <ModalOpcoes
        visivel={aberto === "posicao"}
        titulo="Posição"
        opcoes={opcoesPosicao}
        selecionados={posicao === null ? [] : [posicao]}
        multipla={false}
        aoFechar={() => setAberto(null)}
        aoEscolher={(valor) => {
          setPosicao(Number(valor));
          setAberto(null);
        }}
        aoConfirmar={() => setAberto(null)}
      />

      <ModalOpcoes
        visivel={aberto === "licoes"}
        titulo="Lições incluídas"
        opcoes={opcoesLicoes}
        selecionados={licoesIds}
        multipla
        aoFechar={() => setAberto(null)}
        aoEscolher={() => undefined}
        aoConfirmar={(valores) => {
          setLicoesIds(valores.map((valor) => Number(valor)));
          setAberto(null);
        }}
      />

      {aberto === "licoes" && carregandoLicoes ? (
        <View style={styles.carregandoLicoes} pointerEvents="none">
          <ActivityIndicator color="#891CC0" />
        </View>
      ) : null}
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
  faixa: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  tituloFaixa: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    marginTop: 2,
  },
  subtituloFaixa: {
    fontFamily: "Poppins_600SemiBold",
    color: "#3B2600",
    marginTop: 8,
  },
  cartao: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E9E3ED",
    padding: 14,
    gap: 12,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  linhaDupla: {
    flexDirection: "row",
    gap: 8,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "#F3F0F4",
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  campoCompacto: {
    gap: 6,
    paddingHorizontal: 10,
  },
  entrada: {
    flex: 1,
    minWidth: 0,
    fontFamily: "Poppins_600SemiBold",
    paddingVertical: 0,
  },
  valor: {
    flex: 1,
    minWidth: 0,
    fontFamily: "Poppins_600SemiBold",
  },
  areaBotao: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 18,
    shadowColor: "#5A3C6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  areaBotaoPressionada: {
    opacity: 0.9,
  },
  botao: {
    minHeight: 92,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  textoBotao: {
    fontFamily: "Poppins_900Black",
    color: "#303030",
    textAlign: "center",
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(26, 5, 36, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  caixaModal: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  tituloModal: {
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    marginBottom: 12,
  },
  listaModal: {
    flexGrow: 0,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 4,
  },
  textoOpcao: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
  },
  botaoModal: {
    marginTop: 12,
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoModal: {
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },
  cancelarModal: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCancelar: {
    fontFamily: "Poppins_600SemiBold",
  },
  carregandoLicoes: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
