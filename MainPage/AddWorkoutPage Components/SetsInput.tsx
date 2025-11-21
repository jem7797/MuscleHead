import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Set {
  reps: string;
  weight: string;
}

interface SetsInputProps {
  workoutName: string;
  sets: Set[];
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (index: number, field: "reps" | "weight", value: string) => void;
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
          <Text style={styles.setHeaderText}>Set</Text>
          <Text style={styles.setHeaderText}>Reps</Text>
          <Text style={styles.setHeaderText}>Weight (lbs)</Text>
          <View style={styles.setHeaderText} />
        </View>
        
        {sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={styles.setNumber}>{index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={set.reps}
              onChangeText={(text) => onUpdateSet(index, "reps", text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="0"
              value={set.weight}
              onChangeText={(text) => onUpdateSet(index, "weight", text)}
              keyboardType="numeric"
            />
            {sets.length > 1 && (
              <TouchableOpacity onPress={() => onRemoveSet(index)} style={styles.removeButton}>
                <Ionicons name="close" size={18} color="#888" />
              </TouchableOpacity>
            )}
            {sets.length === 1 && <View style={styles.removeButton} />}
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
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  setsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  setsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    flex: 1,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fafafa",
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
  removeButton: {
    width: 20,
    height: 20,
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

