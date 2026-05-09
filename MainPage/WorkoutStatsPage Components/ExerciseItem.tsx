import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  borderSubtle,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

interface Set {
  reps: string;
  weight: string;
}

interface ExerciseItemProps {
  workout: string;
  muscleGroup: string | null;
  sets: Set[];
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ workout, muscleGroup, sets }) => {
  return (
    <View style={styles.exerciseItem}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{workout}</Text>
        <Text style={styles.exerciseMuscleGroup}>{muscleGroup}</Text>
      </View>
      <View style={styles.exerciseSets}>
        {sets.map((set, setIndex) => (
          set.reps && set.weight ? (
            <Text key={setIndex} style={styles.setText}>
              Set {setIndex + 1}: {set.reps} reps × {set.weight} lbs
            </Text>
          ) : null
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseItem: {
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: textPrimary,
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: textSecondary,
  },
  exerciseSets: {
    gap: 4,
  },
  setText: {
    fontSize: 13,
    color: textSecondary,
  },
});

export default ExerciseItem;

