import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { accent, textSecondary } from "../../theme/colors";

const HeaderSection: React.FC = () => {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.celebrationText}>Workout Complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  celebrationText: {
    fontSize: 30,
    fontWeight: "700",
    color: accent,
    marginBottom: 6,
    marginTop: 70,
  },
  subtitleText: {
    fontSize: 16,
    color: textSecondary,
  },
});

export default HeaderSection;

