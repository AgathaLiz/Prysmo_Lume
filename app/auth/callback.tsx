import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}