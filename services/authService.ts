import { supabase } from "@/lib/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

async function criarSessaoPelaUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return;
  }

  if (params.access_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
  }
}

export async function irParaProximaTela() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("usuario")
    .select("usuario_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  router.replace(data ? "/auth/tela_preferencias" : ("/auth/completar_perfil" as any));
}

async function entrarComProvedor(provider: "google" | "facebook") {
  try {
    // Web: o navegador inteiro vai para o provedor e volta em /auth/callback
    if (Platform.OS === "web") {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }

    // Celular: o código que já existe (openAuthSessionAsync etc.)
    const redirectTo = makeRedirectUri({ scheme: "lumetcc", path: "auth/callback" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) return;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return;

    await criarSessaoPelaUrl(result.url);
    await irParaProximaTela();
  } catch (e) {
    console.error(`Erro no login com ${provider}:`, e);
  }
}

export const signInWithGoogle = () => entrarComProvedor("google");
export const signInWithFacebook = () => entrarComProvedor("facebook");