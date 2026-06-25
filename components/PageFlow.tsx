import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

type Props = {
  total: number;
  currentIndex: number;
  showBack?: boolean;
  onBack?: () => void;
};

// Função para fazer a barrinha de progresso
export function PageFlow({
  total,
  currentIndex,
  showBack = false,
  onBack,
}: Props) {
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 38,
    left: 25,
    right: 25,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 24,
    lineHeight: 24,
    color: "#9A9A9A",
  },

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 58,
    height: 3,
  },
});

