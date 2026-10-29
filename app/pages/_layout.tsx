import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

const ICONES_NAV = {
  inicio: require("../../assets/images/icons/Icons=home.png") as ImageSourcePropType,
  progresso: require("../../assets/images/icons/Icons=estatisticas.png") as ImageSourcePropType,
  perfil: require("../../assets/images/icons/Icons=pefil_tab_bar.png") as ImageSourcePropType,
};

type IconeTabProps = {
  icone: ImageSourcePropType;
  ativo: boolean;
};

function IconeTab({ icone, ativo }: IconeTabProps) {
  return (
    <View style={styles.centro}>
      {ativo ? (
        <LinearGradient
          colors={["#FFD36E", "#F3A6B8", "#C77DFF"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.circuloAtivo}
        >
          <Image source={icone} style={styles.iconeAtivo} resizeMode="contain" />
        </LinearGradient>
      ) : (
        <Image source={icone} style={styles.iconeInativo} resizeMode="contain" />
      )}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1F1F1F",
          tabBarInactiveTintColor: "#6B6470",
          tabBarStyle: {
            position: "absolute",
            left: 18,
            right: 18,
            bottom: Math.max(insets.bottom, 12),
            height: 80,
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E9E3ED",
            paddingHorizontal: 18,
            paddingTop: 0,
            paddingBottom: 0,
            shadowColor: "#1A0524",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 16,
            elevation: 12,
          },
          tabBarItemStyle: {
            height: 80,
            paddingVertical: 0,
          },
          tabBarShowLabel: false,
          tabBarIconStyle: {
            width: "100%",
            height: "100%",
          },
          animation: "fade",
        }}
      >
        <Tabs.Screen
          name="tela_inicial"
          options={{
            title: "Início",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <IconeTab icone={ICONES_NAV.inicio} ativo={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tela_opcoes"
          options={{
            title: "Desempenho",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <IconeTab icone={ICONES_NAV.progresso} ativo={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tela_usuario"
          options={{
            title: "Perfil",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <IconeTab icone={ICONES_NAV.perfil} ativo={focused} />
            ),
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  circuloAtivo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B36BE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  iconeAtivo: {
    width: 26,
    height: 26,
  },
  iconeInativo: {
    width: 26,
    height: 26,
    opacity: 0.65,
  },
});
