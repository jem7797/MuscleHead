import React from "react";
import { View, Text, StyleSheet } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

interface HeightPickerProps {
  heightFeet: number;
  heightInches: number;
  onFeetChange: (feet: number) => void;
  onInchesChange: (inches: number) => void;
}

const HeightPicker: React.FC<HeightPickerProps> = ({
  heightFeet,
  heightInches,
  onFeetChange,
  onInchesChange,
}) => {
  const heightFeetOptions = Array.from({ length: 4 }, (_, i) => i + 4); // 4–7 feet
  const heightInchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0–11 inches

  return (
    <>
      <Text style={styles.label}>Select Your Height</Text>
      <View style={styles.wheelRow}>
        <View style={styles.wheelWrapper}>
          <WheelPickerExpo
            height={200}
            width={120}
            initialSelectedIndex={heightFeetOptions.indexOf(heightFeet)}
            items={heightFeetOptions.map((h) => ({ label: `${h} ft`, value: h }))}
            onChange={({ item }) => onFeetChange(item.value)}
            backgroundColor="rgba(254, 253, 253, 0)"
            selectedStyle={{ borderColor: "#3b6fb8", borderWidth: 2 }}
          />
        </View>
        <View style={styles.wheelWrapper}>
          <WheelPickerExpo
            height={200}
            width={120}
            initialSelectedIndex={heightInchesOptions.indexOf(heightInches)}
            items={heightInchesOptions.map((i) => ({ label: `${i} in`, value: i }))}
            onChange={({ item }) => onInchesChange(item.value)}
            backgroundColor="rgba(254, 253, 253, 0)"
            selectedStyle={{ borderColor: "#3b6fb8", borderWidth: 2 }}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 40,
    textAlign: "center",
    textTransform: "uppercase",
  },
  wheelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
  },
  wheelWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default HeightPicker;

