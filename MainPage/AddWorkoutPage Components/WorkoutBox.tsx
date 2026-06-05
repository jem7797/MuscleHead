import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SelectorButton from "../../Components/SelectorButton";
import SetsInput, { type WorkoutSetInput } from "./SetsInput";
import type { PreviousAttemptSet } from "../../Services/sessionInstanceApi";
import { borderSubtle, surfaceMuted, textSecondary } from "../../theme/colors";

interface Workout {
  id: number;
  muscleGroup: string | null;
  workout: string | null;
  sets: WorkoutSetInput[];
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
  onUpdateSet: (
    index: number,
    field: "reps" | "weight" | "completed" | "setType",
    value: string | boolean,
  ) => void;
  previousSets?: PreviousAttemptSet[] | null;
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
  previousSets,
}) => {
  return (
    <View style={styles.workoutBox}>
      {canRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeWorkoutButton}>
          <Ionicons name="trash-outline" size={18} color={textSecondary} />
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
          previousSets={previousSets}
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
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
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

