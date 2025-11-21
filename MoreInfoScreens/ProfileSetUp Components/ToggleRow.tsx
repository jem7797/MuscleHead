import React from "react";
import { View, Text, Switch, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.toggleRow}>
      <View>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? "#013cdeff" : "#f4f3f4"}
        trackColor={{ false: "rgba(255,255,255,0.2)", true: "rgba(1,60,222,0.4)" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleDescription: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
    width: SCREEN_WIDTH * 0.55,
  },
});

export default ToggleRow;

