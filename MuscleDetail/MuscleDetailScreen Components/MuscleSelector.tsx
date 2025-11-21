import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

interface MuscleInfo {
  name: string;
  subname: string;
  description: string;
  exercises: string[];
}

interface MuscleSelectorProps {
  muscles: Record<string, MuscleInfo>;
  selectedMuscle: string | null;
  onSelect: (muscleId: string) => void;
}

const MuscleSelector: React.FC<MuscleSelectorProps> = ({
  muscles,
  selectedMuscle,
  onSelect,
}) => {
  return (
    <View style={styles.muscleSelector}>
      <Text style={styles.selectorTitle}>Select Muscle:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {Object.keys(muscles).map((muscleId) => (
          <TouchableOpacity
            key={muscleId}
            style={[
              styles.muscleButton,
              selectedMuscle === muscleId && styles.muscleButtonActive,
            ]}
            onPress={() => onSelect(muscleId)}
          >
            <Text
              style={[
                styles.muscleButtonText,
                selectedMuscle === muscleId && styles.muscleButtonTextActive,
              ]}
            >
              {muscles[muscleId].name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  muscleSelector: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  selectorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 10,
  },
  selectorScroll: {
    flexDirection: "row",
  },
  muscleButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f4f6fa",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e6f0",
    bottom: 0,
  },
  muscleButtonActive: {
    backgroundColor: "#202c76",
    borderColor: "#202c76",
  },
  muscleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#51607a",
  },
  muscleButtonTextActive: {
    color: "#fff",
  },
});

export default MuscleSelector;

