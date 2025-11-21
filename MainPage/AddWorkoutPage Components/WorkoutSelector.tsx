import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

interface WorkoutSelectorProps {
  workouts: string[];
  selectedWorkout: string | null;
  onSelect: (workout: string) => void;
}

const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({
  workouts,
  selectedWorkout,
  onSelect,
}) => {
  if (!workouts || workouts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Workout</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout}
            style={[
              styles.workoutButton,
              selectedWorkout === workout && styles.workoutButtonActive,
            ]}
            onPress={() => onSelect(workout)}
          >
            <Text
              style={[
                styles.workoutButtonText,
                selectedWorkout === workout && styles.workoutButtonTextActive,
              ]}
            >
              {workout}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  selectorScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  workoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "white",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  workoutButtonActive: {
    backgroundColor: "#202c76",
    borderColor: "#202c76",
  },
  workoutButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  workoutButtonTextActive: {
    color: "#fff",
  },
});

export default WorkoutSelector;

