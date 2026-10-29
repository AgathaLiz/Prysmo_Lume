import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import {
  Poppins_300Light,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { ActivityIndicator, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AcessibilidadeProvider } from "@/hooks/use-acessibilidade";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [sessaoCarregada, setSessaoCarregada] = useState(false);
  const jaDecidiu = useRef(false);

  // 1. Lê a sessão salva e acompanha login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessaoCarregada(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // 2. Regras de redirecionamento
  useEffect(() => {
  if (!fontsLoaded || !sessaoCarregada) return;

  const area = segments[0] as string | undefined;
  const tela = segments[1] as string | undefined;

  // 1. Retorno do login social: o callback decide sozinho
  if (area === "auth" && tela === "callback") return;

  // 2. Só na abertura do app
  if (!jaDecidiu.current) {
    jaDecidiu.current = true;
    if (area !== "auth") {
      router.replace(
        (session ? "/onboarding/bem_vindo" : "/onboarding/tela_primeiro_acesso") as any
      );
      return;
    }
  }

  // 3. Sem sessão: só pode ficar em auth e no onboarding (exceto o bem_vindo)
  const publica = area === "auth" || (area === "onboarding" && tela !== "bem_vindo");
  if (!session && !publica && area !== undefined) {
    router.replace("/auth/login/contas" as any);
  }
}, [session, sessaoCarregada, fontsLoaded, segments]);

  // 3. Tela de carregamento enquanto fontes e sessão não estão prontas
  if (!fontsLoaded || !sessaoCarregada) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AcessibilidadeProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AcessibilidadeProvider>
  );
}