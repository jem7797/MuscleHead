import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      <Ionicons name="add" size={18} color="#888" />
      <Text style={[styles.addWorkoutText, disabled && styles.addWorkoutTextDisabled]}>Add Workout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addWorkoutButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  addWorkoutText: {
    color: "#666",
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

