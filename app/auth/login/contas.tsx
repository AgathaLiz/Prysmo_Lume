import { signInWithFacebook, signInWithGoogle } from "@/services/authService";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ExternalLink } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BotaoVoltar } from "@/components/BotaoVoltar";
import { GuiaMimi, useAlvoGuia } from "@/components/GuiaMimi";
import {
  concluirFluxoEssencial,
  deveMostrarGuiaTela,
} from "@/lib/primeiro-acesso";
import { PageFlow } from "../../../components/PageFlow";

const PASSOS_CONTAS = [
  "Você pode entrar usando a sua conta do Google. Ao tocar aqui, o aplicativo vai abrir a página do Google para confirmar e depois volta sozinho para cá.",
  "Ou pode entrar com o seu Facebook. Ele também vai te levar para a página do Facebook para confirmar e depois volta para o Lume.",
  "Se você já criou uma conta com e-mail e senha aqui no Lume, toque em Fazer Login.",
  "Ainda não tem uma conta? Toque aqui em Se Cadastrar para criar a sua agora.",
];

export default function LoginSocialScreen() {
  const insets = useSafeAreaInsets();
  const [guiaAtivo, setGuiaAtivo] = useState(false);
  const [passo, setPasso] = useState(0);

  const refGoogle = useRef<View>(null);
  const refFacebook = useRef<View>(null);
  const refLogin = useRef<View>(null);
  const refCadastrar = useRef<View>(null);
  const refs = useMemo(
    () => [refGoogle, refFacebook, refLogin, refCadastrar],
    []
  );
  const { alvo, remedir } = useAlvoGuia(guiaAtivo, passo, refs);

  useEffect(() => {
    let ativo = true;
    deveMostrarGuiaTela("contas").then((mostrar) => {
      if (ativo && mostrar) setGuiaAtivo(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.topo, { top: insets.top + 8 }]}>
        <BotaoVoltar
          cor="#303030"
          onPress={() => router.replace("/onboarding/tela_primeiro_acesso")}
        />
      </View>
         
      
      <View style={styles.ilustracaoBox}>
        <Image
          source={require("../../../assets/Lume/Capa do app/Png/capa-app-roxa.png")}
          style={styles.ilustracao}
          resizeMode="contain"
        />
      </View>
      

      <Text style={styles.title}>Como deseja entrar?</Text>

      <View ref={refGoogle} collapsable={false} style={styles.envoltorioAlvo}>
        <TouchableOpacity style={styles.socialButton} onPress={signInWithGoogle}>
          <Image
            source={require("../../../assets/images/icons/google_icon.png")}
            style={styles.icon}
          />
          <Text style={[styles.socialText, { flex: 1 }]}>Entrar com Google</Text>
          <ExternalLink size={18} color="#6D5E75" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <View ref={refFacebook} collapsable={false} style={styles.envoltorioAlvo}>
        <TouchableOpacity style={styles.socialButton} onPress={signInWithFacebook}>
          <Image
            source={require("../../../assets/images/icons/facebook_icon.png")}
            style={styles.icon}/>  
          <Text style={[styles.socialText, { flex: 1 }]}>Entrar com Facebook</Text>
          <ExternalLink size={18} color="#6D5E75" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <View ref={refLogin} collapsable={false} style={styles.envoltorioAlvo}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => router.push("/auth/login/login")}
        >
          <Image
            source={require("../../../assets/images/icons/user_icon.png")}
            style={styles.icon}
          />
          <Text style={styles.socialText}>Fazer Login</Text>
        </TouchableOpacity>
      </View>

      <View ref={refCadastrar} collapsable={false} style={styles.cadastroCard}>

        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/cadastro")}>
             <LinearGradient
              colors={["#FFD651", "#D987FF"]}
              start={{x:0, y:0}}
              end={{x:1, y:1}}
              style={styles.cadastroButton}>
              <Text style={styles.cadastroText}>Se Cadastrar</Text>
            </LinearGradient>
          
        </TouchableOpacity>
      </View>

      <PageFlow total={4} currentIndex={0} />

      <GuiaMimi
        visivel={guiaAtivo}
        alvo={alvo}
        texto={PASSOS_CONTAS[passo]}
        passoAtual={passo + 1}
        totalPassos={PASSOS_CONTAS.length}
        textoBotaoPrincipal={passo === PASSOS_CONTAS.length - 1 ? "Entendi" : "Próximo"}
        aoPressionarPrincipal={() => {
          if (passo < PASSOS_CONTAS.length - 1) {
            setPasso((p) => p + 1);
            setTimeout(remedir, 80);
          } else {
            setGuiaAtivo(false);
          }
        }}
        aoPressionarSecundario={() => {
          setGuiaAtivo(false);
          void concluirFluxoEssencial();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 80,
    backgroundColor: "#E9B8FF",
  },
  envoltorioAlvo: {
    width: "100%",
    alignItems: "center",
  },

  topo: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
    

  backText: {
    fontSize: 25,
    fontFamily:"Poppins_600SemiBold",
    lineHeight: 24,
    color: "#9A9A9A",
  },

  ilustracaoBox: {
    width: 200,
    height: 150,
    borderRadius: 130,
    marginTop: 60,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  
  ilustracao: {
    width: "60%",
    height: "76%",
    alignSelf: "center",
    borderRadius: 10,
    
  },

  title: {
    marginTop: 0,
    fontSize: 30,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    color: "#303030",
  },


  socialButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#353435",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  icon: {
    width: 30,
    height: 24,
    resizeMode: "contain",
  },

  socialText: {
    paddingLeft: 12,
    color: "#303030",
    fontFamily:"Poppins_600SemiBold",
    fontSize: 15,
  },

   cadastroCard: {
    width: "70%",
    marginTop: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  footerText: {
    marginTop: 5,
    fontSize: 15,
    fontFamily:"Poppins_600SemiBold",
    color: "#303030",
  },

 cadastroButton: {
    marginTop: 10,
    backgroundColor: "#D9D9D9",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  cadastroText: {
    fontSize: 20,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
  },

  
});