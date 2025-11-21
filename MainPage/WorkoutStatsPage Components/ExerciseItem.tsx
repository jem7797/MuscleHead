import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
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
    color: "#1f2a44",
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: "#666",
  },
  exerciseSets: {
    gap: 4,
  },
  setText: {
    fontSize: 13,
    color: "#666",
  },
});

export default ExerciseItem;

