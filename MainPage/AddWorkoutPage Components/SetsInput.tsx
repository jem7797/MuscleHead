import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Set {
  reps: string;
  weight: string;
  completed?: boolean;
}

interface SetsInputProps {
  workoutName: string;
  sets: Set[];
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (index: number, field: "reps" | "weight" | "completed", value: string | boolean) => void;
}

const SetsInput: React.FC<SetsInputProps> = ({
  workoutName,
  sets,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{workoutName}</Text>

      <View style={styles.setsContainer}>
        <View style={styles.setsHeaderRow}>
          <Text style={styles.setHeaderLabel}>Set</Text>
          <Text style={styles.setHeaderInput}>Reps</Text>
          <Text style={styles.setHeaderInput}>Weight (lbs)</Text>
          <View style={styles.checkHeader} />
        </View>

        {sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={styles.setLabel}>Set {index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Reps"
              placeholderTextColor="#8a9bb5"
              value={set.reps}
              onChangeText={(text) => onUpdateSet(index, "reps", text)}
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit
            />
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              placeholderTextColor="#8a9bb5"
              value={set.weight}
              onChangeText={(text) => onUpdateSet(index, "weight", text)}
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit
            />
            <TouchableOpacity
              style={styles.checkButton}
              onPress={() =>
                onUpdateSet(index, "completed", !(set.completed ?? false))
              }
            >
              <Ionicons
                name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={set.completed ? "#22c55e" : "#8a9bb5"}
              />
            </TouchableOpacity>
            {sets.length > 1 && (
              <TouchableOpacity
                onPress={() => onRemoveSet(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={onAddSet} style={styles.addSetButtonBottom}>
          <Ionicons name="add" size={18} color="#202c76" />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 10,
  },
  setsContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  setsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  setHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    width: 56,
  },
  setHeaderInput: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    flex: 1,
    textAlign: "center",
  },
  checkHeader: {
    width: 32,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    width: 56,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 15,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    marginHorizontal: 4,
    textAlign: "center",
  },
  checkButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  addSetButtonBottom: {
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginTop: 4,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#202c76",
    marginLeft: 4,
  },
});

export default SetsInput;
