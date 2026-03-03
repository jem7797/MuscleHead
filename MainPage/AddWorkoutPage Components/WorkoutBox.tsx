import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SelectorButton from "../../Components/SelectorButton";
import SetsInput from "./SetsInput";

interface Set {
  reps: string;
  weight: string;
  completed?: boolean;
}

interface Workout {
  id: number;
  muscleGroup: string | null;
  workout: string | null;
  sets: Set[];
}

interface WorkoutBoxProps {
  workout: Workout;
  muscleGroups: string[];
  availableWorkouts: string[];
  canRemove: boolean;
  onRemove: () => void;
  onSelectMuscleGroup: (group: string) => void;
  onSelectWorkout: (workout: string) => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (index: number, field: "reps" | "weight" | "completed", value: string | boolean) => void;
}

const WorkoutBox: React.FC<WorkoutBoxProps> = ({
  workout,
  muscleGroups,
  availableWorkouts,
  canRemove,
  onRemove,
  onSelectMuscleGroup,
  onSelectWorkout,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) => {
  return (
    <View style={styles.workoutBox}>
      {canRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeWorkoutButton}>
          <Ionicons name="trash-outline" size={18} color="#888" />
        </TouchableOpacity>
      )}
      
      <SelectorButton
        options={muscleGroups}
        selected={workout.muscleGroup}
        onSelect={onSelectMuscleGroup}
        title="Select Muscle Group"
      />

      {workout.muscleGroup && availableWorkouts.length > 0 && (
        <SelectorButton
          options={availableWorkouts}
          selected={workout.workout}
          onSelect={onSelectWorkout}
          title="Select Workout"
        />
      )}

      {workout.workout && (
        <SetsInput
          workoutName={workout.workout}
          sets={workout.sets}
          onAddSet={onAddSet}
          onRemoveSet={onRemoveSet}
          onUpdateSet={onUpdateSet}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  workoutBox: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    position: "relative",
  },
  removeWorkoutButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

export default WorkoutBox;

