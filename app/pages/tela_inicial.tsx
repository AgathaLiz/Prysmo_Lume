import { router } from "expo-router";
import { Bold } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PageFlow } from "../../components/PageFlow";
import { Tabs } from 'expo-router';

export default function TelaInicial () {

return (
    <View style={styles.container}>
        <Text style={styles.titulo}>Tela inicial</Text>
    </View>
    
);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F4F4",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 25,
        paddingBottom: 80,
    },
    titulo: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#8A8080",
        marginTop: 22,
    }
})