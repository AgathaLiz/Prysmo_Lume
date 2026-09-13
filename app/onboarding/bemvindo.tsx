import { router } from "expo-router";
import { Image as ImageIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PageFlow } from "../../components/PageFlow";

export default function BemVindoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.desenhoBox}>
        <ImageIcon size={40} color="#B5B5B5" />
        <Text style={styles.desenhoTexto}>Desenho</Text>
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

  desenhoBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  desenhoTexto: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#8A8080",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#7A7272",
    marginTop: 105,
  },
});