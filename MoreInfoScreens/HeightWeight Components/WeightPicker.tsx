import React from "react";
import { View, Text, StyleSheet } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

interface WeightPickerProps {
  weight: number;
  onWeightChange: (weight: number) => void;
}

const WeightPicker: React.FC<WeightPickerProps> = ({ weight, onWeightChange }) => {
  const weightOptions = Array.from({ length: 300 }, (_, i) => i + 50); // 50–350

  return (
    <>
      <Text style={styles.label}>Select Your Weight</Text>
      <View style={styles.wheelRow}>
        <View style={styles.wheelWrapper}>
          <WheelPickerExpo
            height={200}
            width={120}
            initialSelectedIndex={weightOptions.indexOf(weight)}
            items={weightOptions.map((w) => ({ label: `${w} lbs`, value: w }))}
            onChange={({ item }) => onWeightChange(item.value)}
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

export default WeightPicker;

