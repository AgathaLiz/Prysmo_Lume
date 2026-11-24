import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAdministrador } from "@/hooks/use-administrador";

type Props = {
  children: React.ReactNode;
};

/**
 * Protege as telas da administração.
 *
 * É o "wrapper" desta parte do app: enquanto confere quem está logado mostra um
 * indicador; se não for administrador, manda de volta para o login e não
 * desenha a tela (nem por um instante).
 */
export function ProtecaoAdmin({ children }: Props) {
  const router = useRouter();
  const { carregando, autorizado } = useAdministrador();

  useEffect(() => {
    if (!carregando && !autorizado) {
      router.replace("/auth/login/login" as never);
    }
  }, [carregando, autorizado, router]);

  if (carregando) {
    return (
      <View style={styles.tela}>
        <ActivityIndicator size="large" color="#891CC0" />
      </View>
    );
  }

  if (!autorizado) return <View style={styles.tela} />;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
