import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Foundation from "@expo/vector-icons/Foundation";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import "../../global.css";

export default function TabLayout() {
  class Evento extends React.Component {
    state = {
      onclick: "",
    };
  }

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#D9D9D9",
          tabBarStyle: {
            position: "absolute",
            display: "flex",
            backgroundColor: "#D9D9D9",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            height: 70,
            justifyContent: "center",
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
            title: "Tela inicial",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.centro]}>
                <View
                  style={[styles.iconContainer, focused && styles.activeCircle]}
                >
                  <Entypo name="home" size={30} color={color} />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tela_opcoes"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.centro]}>
                <View
                  style={[styles.iconContainer, focused && styles.activeCircle]}
                >
                  <Foundation name="list" size={30} color={color} />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tela_usuario"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.centro]}>
                <View style={[styles.iconContainer, focused && styles.activeCircle]}>
                  <FontAwesome name="user" size={30} color={color} />
                </View>
              </View>
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
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
  },
  activeCircle: {
    backgroundColor: "white",
    borderRadius: 30,
  },
});
