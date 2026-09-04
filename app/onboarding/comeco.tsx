import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PageFlow } from "../../components/PageFlow";

// São os slides do começo, com a imagem, o titulo e o subtitulo (frase)
const slides = [
  {
    image: require("../../assets/images/logo.jpg"),
    title: "Bem-vindo(a)",
    subtitle: "Conheça o aplicativo Lume!",
  },
  {
    image: require("../../assets/images/logo.jpg"),
    title: "Aprenda",
    subtitle: "Acesse conteúdos e funcionalidades de forma simples.",
  },
  {
    image: require("../../assets/images/bmo.jpg"),
    title: "Vamos começar?",
    subtitle: "Crie sua conta ou faça login para continuar.",
  },
];

// Essa parte inteira é basicamnet a função das bolinhas la embaixo da pagina (a animação delas)
export default function Home() {
  const [index, setIndex] = useState(0);

  const slide = slides[index];

  //Quando o usuário aperta o último próximo, ele vai levar para a pagina de login
  function nextSlide() {
    if (index === slides.length - 1) {
      router.push("../auth/login/contas");
      return;
    }

    setIndex(index + 1);
  }

  function previousSlide() {
    if (index === 0) return;
    setIndex(index - 1);
  }

  //Aqui é a estilização dos slides
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={slide.image} style={styles.image} />

        <Text style={styles.title}>{slide.title}</Text>

        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/*Criando um link direto para a tela inicial para facilitar o desenvolvimento*/}
        <Link href="/pages/tela_inicial">Ir pra tela inicial</Link>

        {/* Funcionalidade dos botões */}
        <TouchableOpacity style={styles.button} onPress={nextSlide}>
          <Text style={styles.buttonText}>
            {index === slides.length - 1 ? "Começar" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onde fica a barrinha de progresso */}
      <PageFlow
        total={4}
        currentIndex={index}
        showBack={index > 0}
        onBack={previousSlide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 25,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 130,
  },

  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#8C8484",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
    color: "#8C8484",
    textAlign: "center",
  },

  button: {
    marginTop: 28,
    width: "85%",
    backgroundColor: "#D9D9D9",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#8C8484",
  },
});
