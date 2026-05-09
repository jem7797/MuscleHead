import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { borderSubtle, surfaceMuted, textSecondary } from "../../theme/colors";
interface AddWorkoutButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const AddWorkoutButton: React.FC<AddWorkoutButtonProps> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.addWorkoutButton, disabled && styles.addWorkoutButtonDisabled]}
      disabled={disabled}
    >
      <Ionicons name="add" size={18} color={textSecondary} />
      <Text style={[styles.addWorkoutText, disabled && styles.addWorkoutTextDisabled]}>Add Workout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addWorkoutButton: {
    backgroundColor: surfaceMuted,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  addWorkoutText: {
    color: textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  addWorkoutButtonDisabled: {
    opacity: 0.5,
  },
  addWorkoutTextDisabled: {
    color: "#9ca3af",
  },
});

export default AddWorkoutButton;

