import { router } from "expo-router";
import { Bold } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PageFlow } from "../../components/PageFlow";
import { Tabs } from 'expo-router';

async function lerFoto() {
    const foto = document.getElementsByClassName(".foto");

    console.log("foto recebida")
}

export default function TelaUsuario () {

return (
    <View style={styles.container}>
        <View style={styles.viewName}>
            <View>
                <label style={styles.foto}>Foto
                    <input className="foto" type="file" onChange={lerFoto} style={{display: "none"}}/>
                </label>
            </View>
            <View>
                <Text style={{fontWeight: "bold", fontSize: 24, color: "#8A8080"}}>José da Silva</Text>
                <Text style={{fontSize: 16, color: "#8A8080",}}>Descobridor de mundos</Text>
            </View>
        </View>

        <View style={styles.viewConquistas}>
            <View>
                <Text style={styles.textoConquistas}>Moedas</Text>
                <label style={styles.icons}>
                    <input type="" style={{display: "none"}}/>
                </label>
            </View>
            <View>
                <Text style={styles.textoConquistas}>Exp.</Text>
                <label style={styles.icons}>
                    <input type="" style={{display: "none"}}/>
                </label>
            </View>
            <View>
                <Text style={styles.textoConquistas}>Energia</Text>
                <label style={styles.icons}>
                    <input type="" style={{display: "none"}}/>
                </label>
            </View>
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
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 20,
        width: "90%",
        height: "18%",
        borderWidth: 4,
        borderColor: "#8A8080",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
    },
    viewConquistas: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        borderWidth: 4,
        borderColor: "#8A8080",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
    },
    textoConquistas: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 8,
        color: "#8A8080",
    },
    foto: {
        display: "flex", 
        width: 40, 
        height: 40, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#D9D9D9", 
        padding: 20, 
        borderRadius: "50%",
    },
    icons: {
        display: "flex", 
        width: 30, 
        height: 30, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#D9D9D9", 
        padding: 20, 
        borderRadius: "50%",
    }
})