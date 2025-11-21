import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HeaderSection: React.FC = () => {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.celebrationText}>🎉 Workout Complete! 🎉</Text>
      <Text style={styles.subtitleText}>Great job today!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#202c76",
    marginBottom: 8,
    marginTop: 50,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
  },
});

export default HeaderSection;

