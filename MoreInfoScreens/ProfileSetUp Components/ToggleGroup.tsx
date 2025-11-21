import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ToggleRow from "./ToggleRow";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Toggle {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface ToggleGroupProps {
  toggles: Toggle[];
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({ toggles }) => {
  return (
    <View style={styles.toggleGroup}>
      {toggles.map((toggle, index) => (
        <ToggleRow
          key={index}
          label={toggle.label}
          description={toggle.description}
          value={toggle.value}
          onValueChange={toggle.onValueChange}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleGroup: {
    width: SCREEN_WIDTH * 0.85,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});

export default ToggleGroup;

