import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import "../../global.css";
import { BarraNavegacao } from "../../components/BarraNavegacao";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          animation: "fade",
        }}
        tabBar={() => <BarraNavegacao />}
      >
        <Tabs.Screen name="tela_inicial" options={{ title: "Início" }} />
        <Tabs.Screen name="tela_opcoes" options={{ title: "Desempenho" }} />
        <Tabs.Screen name="tela_usuario" options={{ title: "Perfil" }} />

        {/* Telas de configuração: ficam fora da barra, mas mantêm o perfil ativo. */}
        <Tabs.Screen name="aparencia" options={{ href: null }} />
        <Tabs.Screen name="conta" options={{ href: null }} />
        <Tabs.Screen name="acessibilidade" options={{ href: null }} />
        <Tabs.Screen name="configuracoes" options={{ href: null }} />
        <Tabs.Screen name="ajuda" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
