import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { irParaProximaTela } from "../services/authService";

export default function Index() {
  useEffect(() => {
    let feito = false;

    async function decidir(temSessao: boolean) {
      if (feito) return;
      feito = true;

      if (temSessao) {
        await irParaProximaTela();
      } else {
        router.replace("/onboarding/tela_primeiro_acesso" as any);
      }
    }

    supabase.auth.getSession().then(({ data }) => decidir(!!data.session));

    return () => {
      feito = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E9B8FF" }}>
      <ActivityIndicator size="large" color="#303030" />
    </View>
  );
}