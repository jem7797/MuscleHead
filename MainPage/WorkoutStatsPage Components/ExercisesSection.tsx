import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ExerciseItem from "./ExerciseItem";

interface Set {
  reps: string;
  weight: string;
}

interface Workout {
  muscleGroup: string | null;
  workout: string | null;
  sets: Set[];
}

interface ExercisesSectionProps {
  workouts: Workout[];
}

const ExercisesSection: React.FC<ExercisesSectionProps> = ({ workouts }) => {
  return (
    <View style={styles.exercisesSection}>
      <Text style={styles.exercisesTitle}>Exercises Completed</Text>
      {workouts
        .filter(w => w.workout)
        .map((workout, index) => (
          <ExerciseItem
            key={index}
            workout={workout.workout!}
            muscleGroup={workout.muscleGroup}
            sets={workout.sets}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  exercisesSection: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e85d04",
    marginBottom: 16,
  },
});

export default ExercisesSection;

