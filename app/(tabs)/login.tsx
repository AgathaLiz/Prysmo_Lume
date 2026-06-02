import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>

        <Image
          source={require("../../assets/images/download (1).jpg")}
          style={{
            width: 80,
            height: 80,
            resizeMode: "contain",
          }}
        />

        <Text style={styles.titulo}>
          Título exemplo
        </Text>

        <Text style={styles.subtitulo}>
          Lorem lorem lorem lorem lorem
        </Text>
      </View>

      <TextInput
        placeholder="Lorem ipsum"
        placeholderTextColor="#8C8484"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <View style={styles.senhaContainer}>
        <TextInput
          placeholder="Lorem ipsum"
          placeholderTextColor="#8C8484"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          style={styles.senhaInput}
        />

        <TouchableOpacity
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          <Image
            source={require("../../assets/images/padlock.png")}
            style={{
              width:20,
              height: 20,
              resizeMode: "cover",
            }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.links}>
        <Text style={styles.linkClaro}>
          lorem ipsun
        </Text>

        <TouchableOpacity>
          <Text style={styles.linkEscuro}>
            lorem ipsun?
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.botaoTexto}>
          Título exemplo
        </Text>
      </TouchableOpacity>
    </View>

  );
}

type Props = {
  total: number;
  currentIndex: number;
  showBack?: boolean;
  onBack?: () => void;
};

export function CarouselHeader({
  total,
  currentIndex,
  showBack = false,
  onBack,
}: Props) {
  return (
    <View style={styles.carouselContainer}>
      {showBack && (
        <TouchableOpacity
          style={styles.carouselBackButton}
          onPress={onBack}
        >
          <ChevronLeft
            size={18}
            color="#999"
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      )}

      <View style={styles.carouselDotsContainer}>
        {Array.from({ length: total }).map((_, index) => {
          const isActive = index === currentIndex;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.activeDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    fontSize: 80,
  },

  titulo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#8C8484",
    marginTop: 10,
  },

  subtitulo: {
    marginTop: 10,
    color: "#8C8484",
    fontSize: 16,
  },

  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 15,
  },

  senhaContainer: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  senhaInput: {
    flex: 1,
    paddingVertical: 16,
  },

  eye: {
    fontSize: 20,
  },

  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 40,
  },

  linkClaro: {
    color: "#A5A5A5",
  },

  linkEscuro: {
    color: "#7A7272",
    fontWeight: "600",
  },

  botao: {
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingVertical: 18,
  },

  botaoTexto: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#8C8484",
  },

  footer: {
    marginTop: 70,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  voltar: {
    width: 40,
    height: 40,
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },

  seta: {
    fontSize: 20,
  },

  progresso: {
    flexDirection: "row",
    alignItems: "center",
  },

  linha: {
    width: 90,
    height: 3,
    backgroundColor: "#CFCFCF",
    marginHorizontal: 4,
  },

  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  carouselBackButton: {
    position: "absolute",
    left: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },

  carouselDotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
  },

  activeDot: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
  },
});