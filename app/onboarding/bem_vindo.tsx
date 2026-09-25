import { router } from "expo-router";
import { Image as ImageIcon } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PageFlow } from "../../components/PageFlow";



export default function BemVindoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.imagemContainer}>
                <Image
                    source={require("../../assets/Lume/Facilidades pro app/Png/Outros Fundos/fundoMaior.png")}
                    style={styles.imagemFundo}
                    resizeMode="cover"
                  />
              </View>
      
      <View style={styles.desenhoBox}>
        <Image
          source={require("../../assets/Lume/Mimi/Png/mimi-voando.png")}
          style={styles.logo}
          />
      </View>

      <Text style={styles.titulo}>Bem Vindo (a)</Text>

      <PageFlow total={4} currentIndex={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 60,
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

  logo: {
    width: 250,
    height: 300,
    resizeMode: "contain",
    overflow: "hidden",
    transform: [
    { rotate: "340deg" },
  
  ],
  },

  desenhoBox: {
    alignItems: "center",
    justifyContent: "center",
  },

 
  titulo: {
    fontSize: 35,
    fontFamily: "Poppins_800ExtraBold",
    color: "#303030",
    marginTop: 105,
  },
});