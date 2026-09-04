import { router } from "expo-router";
import { Bold } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PageFlow } from "../../components/PageFlow";
import { Tabs } from 'expo-router';
import { Label } from "@react-navigation/elements";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

async function lerFoto() {
    const foto = document.getElementsByClassName(".foto");

    console.log("foto recebida")
}

export default function TelaUsuario () {

return (
    <View style={styles.container}>
        <View style={styles.viewName}>
            <View style={styles.foto}>
                <Text>Foto</Text>
                <Image className="foto" style={{display: "none"}}/>
            </View>
            <View>
                <Text style={{fontWeight: "bold", fontSize: 24, color: "#8A8080" }}>José da Silva</Text>
                <Text style={{fontSize: 16, color: "#8A8080",}}>Descobridor de mundos</Text>
            </View>
        </View>

        <View style={styles.viewConquistas}>
            <View>
                <Text style={styles.textoConquistas}>Moedas</Text>
                <View style={styles.icons}/>
            </View>
            <View>
                <Text style={styles.textoConquistas}>Exp.</Text>
                <View style={styles.icons}/>
            </View>
            <View>
                <Text style={styles.textoConquistas}>Energia</Text>
                <View style={styles.icons} />
            </View>
        </View>

        <View style={styles.viewOpcoes}>
            <View style = {styles.opcao}>
                <Text style={styles.textoOpcoes}>Configurações gerais</Text>
                <AntDesign name="right" size={16} color="#8A8080" />
            </View>
            <View style = {styles.divider}/>
            <View style = {styles.opcao}>
                <Text style={styles.textoOpcoes}>Aparência do Aplicativo</Text>
                <AntDesign name="right" size={16} color="#8A8080" />
            </View>
            <View style = {styles.divider}/>
            <View style = {styles.opcao}>
                <Text style={styles.textoOpcoes}>Acessibilidade</Text>
                <AntDesign name="right" size={16} color="#8A8080" />
            </View>
            <View style = {styles.divider}/>
            <View style = {styles.opcao}>
                <Text style={styles.textoOpcoes}>Central de Ajuda</Text>
                <AntDesign name="right" size={16} color="#8A8080" />
            </View>
        </View>

        <View style={styles.viewSaida}>
            <Ionicons name="exit-outline" size={32} color="#8A8080" />
            <Text style={{fontWeight: "bold", color: "#8A8080", textAlign: "left", fontSize: 24, marginLeft: 10}}>Sair da conta</Text>
        </View>

    </View>
);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        alignItems: "center",
        padding: 0,
        margin: 0,
        color: "#8A8080",
    },
    viewName: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 30,
        width: "90%",
        height: "18%",
        backgroundColor: "white",
        padding: 20,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        borderRadius: 20,
    },
    viewConquistas: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        backgroundColor: "white",
        padding: 20,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        borderRadius: 20,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#D9D9D9',
        opacity: 0.8,
        width: '100%',
        marginVertical: 8,
    },
    textoConquistas: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 8,
        color: "#8A8080",
    },
    foto: {
        display: "flex", 
        width: 80, 
        height: 80, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#D9D9D9", 
        padding: 20, 
        borderRadius: "50%",
    },
    icons: {
        display: "flex", 
        width: 60, 
        height: 60, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#D9D9D9", 
        padding: 20, 
        borderRadius: "50%",
    },
    viewOpcoes: {
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 20,
        width: "90%",
        backgroundColor: "white",
        padding: 20,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        borderRadius: 20,
    },
    textoOpcoes: {
        fontWeight: "bold",
        color: "#8A8080",
        textAlign: "left",
        fontSize: 16
    },
    opcao: {
        width: "100%",
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center", 
        marginBottom: 8,
    },
    viewSaida: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        backgroundColor: "white",
        padding: 20,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        borderRadius: 20,
    }

})