import {
  BatteryFull,
  Car,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Save,
  User,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAcessibilidade } from "@/hooks/use-acessibilidade";
import type { TelaFicticia } from "@/lib/simulacao";

// O celular de mentirinha é sempre claro, como um aparelho de verdade,
// mesmo quando o app está no modo escuro.
const COR_TEXTO = "#303030";
const COR_SECUNDARIA = "#8A8080";
const COR_BORDA = "#D9D9D9";
const COR_SUAVE = "#F4F4F4";

type Props = {
  tela: TelaFicticia;
  alvoAtual: string;
  onToque: (alvo: string) => void;
  /** Durante o "Muito bem!" os toques ficam travados por um instante. */
  desabilitado: boolean;
};

type AlvoProps = {
  alvo: string;
  alvoAtual: string;
  onToque: (alvo: string) => void;
  desabilitado: boolean;
  rotulo: string;
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Qualquer elemento tocável do celular de mentirinha.
 * O alvo do passo atual ganha uma borda roxa e um brilho suave.
 */
function Alvo({
  alvo,
  alvoAtual,
  onToque,
  desabilitado,
  rotulo,
  children,
  estilo,
}: AlvoProps) {
  const { tema } = useAcessibilidade();
  const ativo = alvo === alvoAtual;

  return (
    <TouchableOpacity
      onPress={() => onToque(alvo)}
      disabled={desabilitado}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desabilitado }}
      style={[
        styles.alvo,
        { borderColor: "transparent" },
        estilo,
        ativo && {
          borderColor: tema.roxoEscuro,
          shadowColor: tema.roxo,
          shadowOpacity: 0.9,
          shadowRadius: 10,
          elevation: 8,
        },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

export function TelasFicticias({ tela, alvoAtual, onToque, desabilitado }: Props) {
  const { fonte } = useAcessibilidade();

  const props = { alvoAtual, onToque, desabilitado };

  return (
    <View style={{ flex: 1 }}>
      <BarraDeStatus />

      {tela === "home" && (
        <View style={styles.telaHome}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            Início
          </Text>

          <View style={styles.gradeApps}>
            <App
              {...props}
              alvo="app_telefone"
              nome="Telefone"
              cor="#2E7D32"
              Icone={Phone}
            />
            <App
              {...props}
              alvo="app_contatos"
              nome="Contatos"
              cor="#7B1FA2"
              Icone={Users}
            />
            <App
              {...props}
              alvo="app_mensagens"
              nome="Mensagens"
              cor="#1976D2"
              Icone={MessageCircle}
            />
            <App
              {...props}
              alvo="app_uber"
              nome="Uber"
              cor="#111111"
              Icone={Car}
            />
            <App
              {...props}
              alvo="app_email"
              nome="E-mail"
              cor="#C62828"
              Icone={Mail}
            />
          </View>
        </View>
      )}

      {tela === "telefone" && (
        <View style={styles.telaConteudo}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            Telefone
          </Text>

          <Text style={[styles.legenda, { color: COR_SECUNDARIA, fontSize: fonte(14) }]}>
            Toque em um contato
          </Text>

          <Alvo
            {...props}
            alvo="contato_maria"
            rotulo="Contato Maria"
            estilo={styles.contato}
          >
            <View style={styles.avatar}>
              <User size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.nomeContato, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              Maria
            </Text>
          </Alvo>

          <Alvo
            {...props}
            alvo="contato_joao"
            rotulo="Contato João"
            estilo={styles.contato}
          >
            <View style={[styles.avatar, { backgroundColor: "#1976D2" }]}>
              <User size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.nomeContato, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              João
            </Text>
          </Alvo>

          <View style={styles.areaLigar}>
            <Alvo
              {...props}
              alvo="botao_ligar"
              rotulo="Botão verde para ligar"
              estilo={styles.botaoLigar}
            >
              <Phone size={30} color="#FFFFFF" />
            </Alvo>
            <Text style={[styles.legenda, { color: COR_SECUNDARIA, fontSize: fonte(14) }]}>
              Ligar
            </Text>
          </View>
        </View>
      )}

      {tela === "contatos" && (
        <View style={styles.telaConteudo}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            Contatos
          </Text>

          <Alvo
            {...props}
            alvo="botao_novo_contato"
            rotulo="Botão Novo contato"
            estilo={styles.botaoNovoContato}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={[styles.textoBotaoContato, { fontSize: fonte(15) }]}>
              Novo contato
            </Text>
          </Alvo>

          <Text style={[styles.legenda, { color: COR_SECUNDARIA, fontSize: fonte(14) }]}>
            Seus contatos
          </Text>

          <View style={styles.contato}>
            <View style={styles.avatar}>
              <User size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.nomeContato, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              Maria
            </Text>
          </View>

          <View style={styles.contato}>
            <View style={[styles.avatar, { backgroundColor: "#1976D2" }]}>
              <User size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.nomeContato, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              João
            </Text>
          </View>
        </View>
      )}

      {tela === "novo_contato" && (
        <View style={styles.telaConteudo}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            Novo contato
          </Text>

          <Alvo
            {...props}
            alvo="campo_nome"
            rotulo="Campo Nome, escrito Maria"
            estilo={[styles.campoContato, { borderColor: COR_BORDA }]}
          >
            <Text style={[styles.rotuloCampo, { color: COR_SECUNDARIA, fontSize: fonte(12) }]}>
              Nome
            </Text>
            <Text style={[styles.valorCampo, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              Maria
            </Text>
          </Alvo>

          <Alvo
            {...props}
            alvo="campo_telefone"
            rotulo="Campo Telefone, escrito 11 98765 4321"
            estilo={[styles.campoContato, { borderColor: COR_BORDA }]}
          >
            <Text style={[styles.rotuloCampo, { color: COR_SECUNDARIA, fontSize: fonte(12) }]}>
              Telefone
            </Text>
            <Text style={[styles.valorCampo, { color: COR_TEXTO, fontSize: fonte(17) }]}>
              (11) 98765-4321
            </Text>
          </Alvo>

          <Alvo
            {...props}
            alvo="botao_salvar_contato"
            rotulo="Botão Salvar contato"
            estilo={styles.botaoSalvarContato}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={[styles.textoBotaoContato, { fontSize: fonte(16) }]}>
              Salvar
            </Text>
          </Alvo>

          <Text style={[styles.legenda, { color: COR_SECUNDARIA, fontSize: fonte(13) }]}>
            Confira os dados e toque em Salvar
          </Text>
        </View>
      )}

      {tela === "uber" && (
        <View style={styles.telaConteudo}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            Uber
          </Text>

          <Alvo
            {...props}
            alvo="campo_destino"
            rotulo="Campo para escrever o destino"
            estilo={[styles.campo, { borderColor: COR_BORDA }]}
          >
            <Text style={[styles.textoCampo, { color: COR_SECUNDARIA, fontSize: fonte(15) }]}>
              Para onde você vai?
            </Text>
          </Alvo>

          <Alvo
            {...props}
            alvo="botao_pedir_uber"
            rotulo="Botão pedir carro"
            estilo={[styles.botaoUber, { backgroundColor: "#111111" }]}
          >
            <Text style={[styles.textoBotaoUber, { fontSize: fonte(16) }]}>
              Pedir carro
            </Text>
          </Alvo>

          <Text style={[styles.legenda, { color: COR_SECUNDARIA, fontSize: fonte(14) }]}>
            Um carro vai até você
          </Text>
        </View>
      )}

      {tela === "email" && (
        <View style={styles.telaConteudo}>
          <Text style={[styles.tituloTela, { color: COR_TEXTO, fontSize: fonte(17) }]}>
            E-mail
          </Text>

          <Alvo
            {...props}
            alvo="email_suspeito"
            rotulo="E-mail do Banco Lume dizendo que a conta será bloqueada"
            estilo={[styles.email, { borderColor: COR_BORDA }]}
          >
            <Text style={[styles.remetente, { color: COR_TEXTO, fontSize: fonte(15) }]}>
              Banco Lume
            </Text>
            <Text style={[styles.assunto, { color: COR_TEXTO, fontSize: fonte(15) }]}>
              Sua conta será bloqueada
            </Text>
            <Text style={[styles.corpoEmail, { color: COR_SECUNDARIA, fontSize: fonte(13) }]}>
              Clique no link para confirmar seus dados.
            </Text>
            <Text style={[styles.link, { fontSize: fonte(13) }]}>
              www.lume-seguro.com
            </Text>
          </Alvo>

          <Alvo
            {...props}
            alvo="acao_abrir_link"
            rotulo="Opção abrir o link"
            estilo={[styles.opcaoEmail, { backgroundColor: COR_SUAVE }]}
          >
            <Text style={[styles.textoOpcao, { color: COR_TEXTO, fontSize: fonte(14) }]}>
              Abrir o link
            </Text>
            <ChevronRight size={18} color={COR_SECUNDARIA} />
          </Alvo>

          <Alvo
            {...props}
            alvo="acao_apagar"
            rotulo="Opção apagar o e-mail"
            estilo={[styles.opcaoEmail, { backgroundColor: COR_SUAVE }]}
          >
            <Text style={[styles.textoOpcao, { color: COR_TEXTO, fontSize: fonte(14) }]}>
              Apagar o e-mail
            </Text>
            <ChevronRight size={18} color={COR_SECUNDARIA} />
          </Alvo>

          <Alvo
            {...props}
            alvo="acao_avisar"
            rotulo="Opção avisar um familiar"
            estilo={[styles.opcaoEmail, { backgroundColor: COR_SUAVE }]}
          >
            <Text style={[styles.textoOpcao, { color: COR_TEXTO, fontSize: fonte(14) }]}>
              Avisar um familiar
            </Text>
            <ChevronRight size={18} color={COR_SECUNDARIA} />
          </Alvo>
        </View>
      )}
    </View>
  );
}

function BarraDeStatus() {
  const { fonte } = useAcessibilidade();

  return (
    <View style={styles.statusBar}>
      <Text style={[styles.hora, { color: COR_TEXTO, fontSize: fonte(12) }]}>
        9:41
      </Text>
      <View style={styles.iconesStatus}>
        <Wifi size={14} color={COR_TEXTO} />
        <BatteryFull size={16} color={COR_TEXTO} />
      </View>
    </View>
  );
}

type AppProps = {
  alvo: string;
  alvoAtual: string;
  onToque: (alvo: string) => void;
  desabilitado: boolean;
  nome: string;
  cor: string;
  Icone: ComponentType<{ size?: number; color?: string }>;
};

function App({
  alvo,
  alvoAtual,
  onToque,
  desabilitado,
  nome,
  cor,
  Icone,
}: AppProps) {
  const { fonte } = useAcessibilidade();

  return (
    <Alvo
      alvo={alvo}
      alvoAtual={alvoAtual}
      onToque={onToque}
      desabilitado={desabilitado}
      rotulo={`Aplicativo ${nome}`}
      estilo={styles.app}
    >
      <View style={[styles.iconeApp, { backgroundColor: cor }]}>
        <Icone size={26} color="#FFFFFF" />
      </View>
      <Text style={[styles.nomeApp, { color: COR_TEXTO, fontSize: fonte(14) }]}>
        {nome}
      </Text>
    </Alvo>
  );
}

const styles = StyleSheet.create({
  alvo: {
    borderWidth: 3,
    borderRadius: 14,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  hora: {
    fontFamily: "Poppins_600SemiBold",
  },
  iconesStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  telaHome: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  telaConteudo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    gap: 8,
  },
  tituloTela: {
    fontFamily: "Poppins_800ExtraBold",
    marginBottom: 2,
  },
  legenda: {
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  gradeApps: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  app: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  iconeApp: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  nomeApp: {
    fontFamily: "Poppins_600SemiBold",
    marginTop: 4,
    textAlign: "center",
  },
  contato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F4F4F4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#7B1FA2",
    alignItems: "center",
    justifyContent: "center",
  },
  nomeContato: {
    fontFamily: "Poppins_600SemiBold",
  },
  botaoNovoContato: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7B1FA2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  textoBotaoContato: {
    color: "#FFFFFF",
    fontFamily: "Poppins_800ExtraBold",
  },
  campoContato: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 1,
  },
  rotuloCampo: {
    fontFamily: "Poppins_600SemiBold",
  },
  valorCampo: {
    fontFamily: "Poppins_600SemiBold",
  },
  botaoSalvarContato: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7B1FA2",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  areaLigar: {
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  botaoLigar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  campo: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  textoCampo: {
    fontFamily: "Poppins_600SemiBold",
  },
  botaoUber: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  textoBotaoUber: {
    color: "#FFFFFF",
    fontFamily: "Poppins_800ExtraBold",
  },
  email: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#FFFFFF",
    gap: 2,
  },
  remetente: {
    fontFamily: "Poppins_800ExtraBold",
  },
  assunto: {
    fontFamily: "Poppins_600SemiBold",
  },
  corpoEmail: {
    fontFamily: "Poppins_300Light",
  },
  link: {
    color: "#1565C0",
    fontFamily: "Poppins_600SemiBold",
    textDecorationLine: "underline",
  },
  opcaoEmail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textoOpcao: {
    fontFamily: "Poppins_600SemiBold",
  },
});
