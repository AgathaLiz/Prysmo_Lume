import { signInWithFacebook, signInWithGoogle } from "@/services/authService";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PageFlow } from "../../../components/PageFlow";

export default function LoginSocialScreen() {
  return (
    <View style={styles.container}>
          <View style={styles.imagemContainer}>
            <Image
              source={require("../../../assets/Lume/Facilidades pro app/Png/Outros Fundos/fundoMaior.png")}
              style={styles.imagemFundo}
              resizeMode="cover"
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

      <TouchableOpacity style={styles.socialButton}  onPress={signInWithGoogle}>
        <Image
          source={require("../../../assets/images/google_icon.png")}
          style={styles.icon}
        />
        <Text style={styles.socialText}>Entrar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={signInWithFacebook}>
        <Image
          source={require("../../../assets/images/facebook_icon.png")}
          style={styles.icon}/>  
        <Text style={styles.socialText}>Entrar com Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => router.push("../login/login")}
      >
        <Image
          source={require("../../../assets/images/user_icon.png")}
          style={styles.icon}
        />
        <Text style={styles.socialText}>Fazer Login</Text>
      </TouchableOpacity>

      <View style={styles.cadastroCard}>

        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
        <TouchableOpacity
          onPress={() => router.push("../cadastro")}>
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
  },
    imagemContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden", 
  },

    imagemFundo: {
      width: "100%",
      height: "100%",
      transform: [
      { scale: 1.3 },
      { translateY: -40 },
      ],
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