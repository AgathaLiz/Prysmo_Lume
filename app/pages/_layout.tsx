import { Tabs } from 'expo-router';
import React from 'react';
import "../../global.css"
import { StatusBar } from "expo-status-bar";
import Entypo from '@expo/vector-icons/Entypo';
import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colorScheme } from 'nativewind';
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { PageFlow } from "../../components/PageFlow";


export default function TabLayout() {
  return (
    <React.Fragment>
        <StatusBar style="auto" />
        <Tabs screenOptions={{      
            tabBarActiveTintColor: 'black',            
            tabBarActiveBackgroundColor: 'light-gray',   
            tabBarStyle: { 
                position: 'absolute',
                backgroundColor: "#D3D3D3", 
                borderTopWidth: 0,
                height: 60,
                padding: 10,
             },
            tabBarShowLabel: false,
            animation: 'fade',
            tabBarVariant: 'uikit',
        }}  
        >
            <Tabs.Screen 
                name="tela_inicial"
                options={{
                    title: "Tela inicial",
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <Entypo name="home" size={38} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="tela_opcoes"
                options={{
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <Foundation name="list" size={40} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="tela_usuario"
                options={{
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <FontAwesome name="user" size={35} color={color} />
                    )
                }}
            />
        </Tabs>
    </React.Fragment>
  );

  
}


const styles = StyleSheet.create({
    tabs: {
        flex: 1,
        position: "absolute",
        backgroundColor: "#D3D3D3",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 25,
        paddingBottom: 80,
        borderWidth: 0,
    },
})