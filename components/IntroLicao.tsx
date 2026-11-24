import { X } from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";

import { BarraStatus } from "@/components/BarraStatus";
import { BotaoGrande } from "@/components/BotaoGrande";
import { useAcessibilidade } from "@/hooks/use-acessibilidade";

const MIMI = require("../assets/Lume/Mimi/Png/mimi-sorrindo.png") as ImageSourcePropType;

/** Proporção original da arte da Mimi (157 x 219). */
const PROPORCAO_MIMI = 219 / 157;

/** Cores do mockup da introdução. */
const Cor = {
  branco: "#FFFFFF",
  quasePreto: "#1A1A1A",
  vermelho: "#E23B2E",
  balao: "#E9C6FB",
  balaoTexto: "#2E1536",
  roxoDestaque: "#BE3FD4",
  bordaCirculo: "#DCD2E4",
  bordaCartao: "#F1E7F6",
};

/** Frases que aparecem em roxo no texto da lição. */
const DESTAQUES = [
  "Nesta lição",
  "salvar o telefone",
  "guardar o telefone",
  "importante",
  "passo de cada vez",
];

type Props = {
  titulo: string;
  descricao: string;
  /** O que a Mimi fala no balão. */
  fala: string;
  /** Etapa atual (1 = introdução). */
  etapaAtual: number;
  totalEtapas: number;
  onFechar: () => void;
  onContinuar: () => void;
};

/**
 * Tela de introdução da lição, seguindo a arte da Mimi.
 *
 * Os tamanhos saem da largura da tela para que os itens preencham o
 * mesmo espaço do mockup: o X e a Mimi à esquerda, o balão e os
 * círculos das etapas à direita, o cartão com o título e a descrição e,
 * por último, o botão "Continuar" de ponta a ponta.
 *
 * A folga que sobra vai para o topo (parte da Mimi e do balão), para o
 * cartão e para o botão, então a tela fica preenchida em qualquer altura,
 * sem sobrar um vazio embaixo. Com fonte grande ou descrição longa a área
 * rola normalmente.
 */
export function IntroLicao({
  titulo,
  descricao,
  fala,
  etapaAtual,
  totalEtapas,
  onFechar,
  onContinuar,
}: Props) {
  const { fonte } = useAcessibilidade();
  const { width: larguraTela } = useWindowDimensions();

  // Medidas tiradas do mockup, proporcionais à largura da tela.
  const margem = Math.round(larguraTela * 0.05);
  const ladoX = Math.min(64, Math.round(larguraTela * 0.16));
  const larguraMimi = Math.round(larguraTela * 0.4);
  const alturaMimi = Math.round(larguraMimi * PROPORCAO_MIMI);
  const espacoColunas = Math.round(larguraTela * 0.025);
  const ladoCirculo = Math.round(larguraTela * 0.08);
  const espacoCirculos = Math.round(larguraTela * 0.032);
  const raioCartao = Math.round(larguraTela * 0.05);
  const espacoInterno = Math.round(larguraTela * 0.05);
  /** Altura do "Continuar": a mesma do botão do quiz. */
  const alturaBotao = Math.min(84, Math.round(larguraTela * 0.2));
  const espacoConteudo = Math.round(larguraTela * 0.04);

  const tituloLimpo = titulo.trim();
  const tituloComPonto = /[:?!.]\s*$/.test(tituloLimpo)
    ? tituloLimpo
    : `${tituloLimpo}:`;

  return (
    <View style={styles.tela}>
      <BarraStatus />

      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          { paddingHorizontal: margem, gap: espacoConteudo },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topo}>
          <View style={{ width: larguraMimi }}>
            <TouchableOpacity
              onPress={onFechar}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sair da lição"
              style={[
                styles.botaoFechar,
                {
                  width: ladoX,
                  height: ladoX,
                  borderRadius: Math.round(ladoX * 0.28),
                },
              ]}
            >
              <X size={Math.round(ladoX * 0.55)} color={Cor.branco} strokeWidth={3} />
            </TouchableOpacity>

            <Image
              source={MIMI}
              style={{
                width: larguraMimi,
                height: alturaMimi,
                marginTop: Math.round(larguraTela * 0.015),
              }}
              resizeMode="contain"
              accessible={false}
            />
          </View>

          <View style={[styles.colunaDireita, { paddingLeft: espacoColunas }]}>
            <View
              style={[
                styles.balao,
                {
                  borderRadius: Math.round(larguraTela * 0.05),
                  paddingHorizontal: Math.round(larguraTela * 0.04),
                  paddingVertical: Math.round(larguraTela * 0.035),
                },
              ]}
            >
              <Text
                style={[
                  styles.textoBalao,
                  { fontSize: fonte(17), lineHeight: fonte(17) * 1.4 },
                ]}
              >
                {fala}
              </Text>
              <View style={styles.balaoPonta} />
            </View>

            <View
              style={[styles.passos, { gap: espacoCirculos }]}
              accessibilityRole="progressbar"
              accessibilityLabel={`Lição ${etapaAtual}`}
            >
              {(() => {
                const quantidade = Math.max(4, totalEtapas);
                const inicio = etapaAtual > quantidade ? etapaAtual - quantidade + 1 : 1;
                return Array.from({ length: quantidade }, (_, indice) => {
                  const numero = inicio + indice;
                  const ativo = numero === etapaAtual;
                  return (
                    <View
                      key={numero}
                      style={[
                        styles.passo,
                        {
                          width: ladoCirculo,
                          height: ladoCirculo,
                          borderRadius: ladoCirculo / 2,
                          backgroundColor: ativo ? Cor.roxoDestaque : Cor.branco,
                          borderColor: ativo ? Cor.roxoDestaque : Cor.bordaCirculo,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.numeroPasso,
                          {
                            color: ativo ? Cor.branco : Cor.quasePreto,
                            fontSize: fonte(15),
                          },
                        ]}
                      >
                        {numero}
                      </Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.cartao,
            {
              borderRadius: raioCartao,
              padding: espacoInterno,
              gap: Math.round(espacoInterno * 0.7),
            },
          ]}
        >
          {tituloLimpo ? (
            <Text
              style={[
                styles.titulo,
                { fontSize: fonte(23), lineHeight: fonte(23) * 1.25 },
              ]}
            >
              {tituloComPonto}
            </Text>
          ) : null}

          {descricao.trim() ? (
            <Text
              style={[
                styles.descricao,
                { fontSize: fonte(18), lineHeight: fonte(18) * 1.4 },
              ]}
            >
              {comDestaques(descricao.trim(), Cor.roxoDestaque)}
            </Text>
          ) : null}
        </View>

        <BotaoGrande
          titulo="Continuar"
          variante="roxo"
          onPress={onContinuar}
          estilo={{ minHeight: alturaBotao, borderRadius: alturaBotao / 2 }}
        />
      </ScrollView>
    </View>
  );
}

/**
 * Divide o texto e pinta as frases conhecidas de roxo.
 * O `Text` de fora define a fonte; os de dentro só mudam a cor.
 */
function comDestaques(texto: string, cor: string) {
  const partes: { trecho: string; destaque: boolean }[] = [];
  let acumulado = "";
  let indice = 0;

  while (indice < texto.length) {
    const achado = DESTAQUES.find(
      (frase) => texto.slice(indice, indice + frase.length).toLowerCase() === frase.toLowerCase()
    );

    if (achado) {
      if (acumulado) {
        partes.push({ trecho: acumulado, destaque: false });
        acumulado = "";
      }
      partes.push({ trecho: texto.slice(indice, indice + achado.length), destaque: true });
      indice += achado.length;
    } else {
      acumulado += texto[indice];
      indice += 1;
    }
  }

  if (acumulado) partes.push({ trecho: acumulado, destaque: false });

  return partes.map((parte, posicao) =>
    parte.destaque ? (
      <Text key={posicao} style={{ color: cor }}>
        {parte.trecho}
      </Text>
    ) : (
      <Text key={posicao}>{parte.trecho}</Text>
    )
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cor.branco,
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 24,
  },
  topo: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  botaoFechar: {
    backgroundColor: Cor.vermelho,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  colunaDireita: {
    flex: 1,
    justifyContent: "space-between",
  },
  balao: {
    backgroundColor: Cor.balao,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 14,
  },
  textoBalao: {
    fontFamily: "Poppins_600SemiBold",
    color: Cor.balaoTexto,
  },
  balaoPonta: {
    position: "absolute",
    bottom: -7,
    left: 16,
    width: 16,
    height: 16,
    backgroundColor: Cor.balao,
    transform: [{ rotate: "45deg" }],
    borderBottomLeftRadius: 4,
  },
  passos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  passo: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroPasso: {
    fontFamily: "Poppins_800ExtraBold",
  },
  cartao: {
    backgroundColor: Cor.branco,
    borderWidth: 1,
    borderColor: Cor.bordaCartao,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontFamily: "Poppins_800ExtraBold",
    color: Cor.quasePreto,
  },
  descricao: {
    fontFamily: "Poppins_600SemiBold",
    color: Cor.quasePreto,
  },
});
