import { BatteryFull, Signal, Wifi } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

/**
 * Barra de status decorativa do mockup das lições (9:41 + sinal, Wi-Fi e
 * bateria). É só enfeite: quem usa leitor de tela não depende dela.
 */
export function BarraStatus() {
  return (
    <View style={styles.barra} pointerEvents="none" accessible={false}>
      <Text style={styles.hora}>9:41</Text>
      <View style={styles.icones}>
        <Signal size={14} color="#303030" />
        <Wifi size={15} color="#303030" />
        <BatteryFull size={16} color="#303030" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  hora: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#303030",
  },
  icones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
