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
      <View style={styles.desenhoBox}>
        <Image
          source={require("../../assets/Lume/Mimi/Png/mimi-voando.png")}
          style={styles.logo}
          />
      </View>

      <Text style={styles.titulo}>Bem Vindo (a)</Text>

      <PageFlow total={4} currentIndex={0} />
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

  logo: {
    width: 250,
    height: 300,
    resizeMode: "contain",
    transform: [
    { rotate: "340deg" },   // gira (graus, com "deg")
  
  ],
  },

  desenhoBox: {
    alignItems: "center",
    justifyContent: "center",
  },

 
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#7A7272",
    marginTop: 105,
  },
});