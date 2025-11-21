import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface WorkoutNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const WorkoutNameInput: React.FC<WorkoutNameInputProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Name your workout</Text>
      <TextInput
        style={styles.workoutNameInput}
        placeholder="Enter workout name..."
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  workoutNameInput: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
});

export default WorkoutNameInput;

