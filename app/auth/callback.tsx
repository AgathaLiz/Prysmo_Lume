import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { irParaProximaTela } from "../../services/authService";

export default function CallbackScreen() {
  useEffect(() => {
    let feito = false;
    const seguir = async () => {
      if (feito) return;
      feito = true;
      await irParaProximaTela();
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) seguir();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "SIGNED_IN" && sessao) seguir();
    });

    const timeout = setTimeout(() => {
      if (!feito) router.replace("/auth/login/contas" as any);
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color="#891CC0" />
      <Text
        style={{
          fontFamily: "Poppins_600SemiBold",
          fontSize: 18,
          color: "#303030",
          textAlign: "center",
        }}
      >
        Entrando na sua conta...
      </Text>
    </View>
  );
}