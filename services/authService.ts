import { supabase } from "@/lib/supabase";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// Finaliza a sessão de autenticação 
WebBrowser.maybeCompleteAuthSession();

// Função que realiza a autenticação do usuário utilizando uma conta Google
export async function signInWithGoogle() {
    try {

        // Gera a URL de retorno utilizada pelo Google para voltar para o app após autenticação.
        const redirectTo = makeRedirectUri({
            scheme: "lumetcc",
            path: "auth/callback",
        });

        // Solicita ao Supabase o início do processo de autenticação com o Google.
        // O Supabase retorna a URL oficial para onde o usuário será enviado.
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo,
                // Impede que o Supabase redirecione automaticamente o navegador
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            throw error;
        }

        console.log("OAuth URL:", data?.url);

        // Verifica se o Supabase retornou corretamente a URL de autenticação.
        if (data?.url) {

            // Abre o navegador para que o usuário escolha uma conta Google.
            // Após a autenticação, o Google redireciona novamente para o aplicativo.
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectTo
            );

            if (result.type === "success") {
                const {
                    data: { session },
                }  = await supabase.auth.getSession();

                if (session) {
                    router.replace("/onboarding/comeco");
                }
            }

        }

    } catch (error) {

        console.error("Erro no login com Google:", error);
    }
}

export async function signInWithFacebook() {
    try {
        const redirectTo = makeRedirectUri({
            scheme: "lumetcc",
            path: "auth/callback",
        });

        console.log("Redirect URI:", redirectTo);
console.log("Execution environment:", process.env.EXPO_OS);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "facebook",
            options: {
                redirectTo,
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            throw error;
        }

        console.log("redirect:", redirectTo);
        console.log("OAuth URL:", data?.url);

        if (data?.url) {
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectTo
            );

             if (result.type === "success") {
                const {
                    data: { session },
                }  = await supabase.auth.getSession();

                if (session) {
                    router.replace("/onboarding/comeco");
                }
            }
        }

    } catch (error) {
        console.error("Erro no login com Facebook:", error);
    }
}