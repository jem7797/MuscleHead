import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

/**
 * ActionButtons Component
 * Displays action buttons (Edit profile, Share profile)
 */
const ActionButtons: React.FC = () => {
  return (
    <View style={styles.actionButtonsRow}>
      <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
        <Text style={styles.actionText}>Edit profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
        <Text style={styles.actionText}>Share profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e6ed",
    backgroundColor: "#f6f8fa",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f1724",
  },
});

export default ActionButtons;

