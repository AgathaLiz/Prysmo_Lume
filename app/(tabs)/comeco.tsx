import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  total: number;
  currentIndex: number;
  showBack?: boolean;
  onBack?: () => void;
};

export function CarouselHeader({
  total,
  currentIndex,
  showBack = false,
  onBack,
}: Props) {
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={18} color="#999" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, index) => {
          const isActive = index === currentIndex;

          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.activeDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
  },

  activeDot: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
  },
});