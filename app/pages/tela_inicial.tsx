import { Label, Button } from "@react-navigation/elements";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
    StyleSheet,
    Text,
    View
} from "react-native";

export default function TelaInicial() {
  return (
    <View style={styles.container}>
      <View style={styles.viewSequencia}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="lightbulb-on-10"
            size={52}
            color="#8A8080"
          />
        </View>
        <View>
          <Text style={{ fontSize: 14, color: "#8A8080", fontWeight: "bold" }}>
            Sua luz está acessa há: n dias
          </Text>
          <Button variant="plain" color="#8A8080" style={styles.botaoEnergizar}>
            Energizar
          </Button>
        </View>
      </View>

      <View style={styles.viewDias}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#8A8080",
            width: "100%",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Últimos 5 dias
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.circulos} />
          <View style={styles.circulos} />
          <View style={styles.circulos} />
          <View style={styles.circulos} />
          <View style={styles.circulos} />
        </View>
      </View>

      <View style={styles.viewProxLicao}>
        <View style={styles.iconProxLicao}></View>
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 30, color: "#8A8080", fontWeight: "bold" }}>
            Próxima lição
          </Text>
          <Text style={{ color: "#8A8080" }}>Pronto(a) para brilhar?</Text>
        </View>
      </View>

      <View style={styles.viewProxLicao}>
        <View style={styles.iconProxLicao}></View>
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 30, color: "#8A8080", fontWeight: "bold" }}>
            Trilhas
          </Text>
          <Text style={{ color: "#8A8080" }}>Ilumine seu próprio caminho</Text>
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
  viewSequencia: {
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
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
  },
  botaoEnergizar: {
    marginTop: 10,
    width: "100%",
    height: 40,
    backgroundColor: "#D9D9D9",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    color: "#8A8080",
    fontWeight: "bold"
    
  },
  viewDias: {
    width: "90%",
    justifyContent: "space-between",
    marginTop: 20,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
  },
  icon: {
    display: "flex",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9D9D9",
    padding: 20,
    borderRadius: "50%",
  },
  iconProxLicao: {
    display: "flex",
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9D9D9",
    padding: 20,
    borderRadius: "50%",
  },
  circulos: {
    display: "flex",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9D9D9",
    padding: 20,
    borderRadius: "50%",
    
  },
  viewProxLicao: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
  },
});
