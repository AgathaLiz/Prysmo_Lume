import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

export default function Home() {
  return (
    <Onboarding
      onDone={() => router.push("/login")}
      onSkip={() => router.push("/login")}
      pages={[
        {
          backgroundColor: "#F4F4F4",

          image: (
              <View>
                <Image
                  source={require("../../assets/images/Lumpy Space Princess Jake The Dog Animation Character Adventure Time PNG.jpg")}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "contain",
                  }}
                />
              </View>
          ),

          title: "Bem-vindo(a)",

          subtitle:
            "Conheça o aplicativo Lume!",
        },

        {
          backgroundColor: "#F4F4F4",

          image: (
              <View>
                <Image
                  source={require("../../assets/images/download (1).jpg")}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "contain",
                  }}
                />
              </View>
          ),
          title: "Aprenda",

          subtitle:
            "Acesse conteúdos e funcionalidades de forma simples.",
        },

        {
          backgroundColor: "#F4F4F4",

          image: (
              <View>
                <Image
                  source={require("../../assets/images/Adventure Time_ Explore The Dungeon Because I Don't Know! Finn The Human Drawing Marceline The Vampire Queen Princess Bubblegum PNG.jpg")}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "contain",
                  }}
                />
              </View>
          ),
          title: "Vamos começar?",

          subtitle:
            "Crie sua conta ou faça login para continuar.",
        },
      ]}
    />
  );
}