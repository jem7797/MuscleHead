import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Text
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";
import HeaderSection from "./WorkoutStatsPage Components/HeaderSection";
import WorkoutNameInput from "./WorkoutStatsPage Components/WorkoutNameInput";
import StatsGrid from "./WorkoutStatsPage Components/StatsGrid";
import ExercisesSection from "./WorkoutStatsPage Components/ExercisesSection";
import PrimaryButton from "../Components/PrimaryButton";

// Map muscle group names to muscle IDs and front/back
const MUSCLE_GROUP_MAP: Record<string, { id: string; side: 'front' | 'back' }[]> = {
  Chest: [{ id: 'pecs', side: 'front' }],
  Arms: [{ id: 'biceps', side: 'front' }, { id: 'triceps', side: 'front' }],
  Shoulders: [{ id: 'delts', side: 'front' }],
  Back: [{ id: 'lats', side: 'back' }],
  Legs: [{ id: 'quads', side: 'front' }, { id: 'hamstrings', side: 'back' }],
  Glutes: [{ id: 'glutes', side: 'back' }],
  Calves: [{ id: 'calves', side: 'back' }],
  Abs: [{ id: 'abs', side: 'front' }],
  Core: [{ id: 'obliques', side: 'front' }],
  Traps: [{ id: 'traps', side: 'back' }],
};

const WorkoutStatsPage = () => {
  const navigation = useNavigation<any>();
  const { stats } = useWorkoutStats();
  const { setGlobalFrontWorked, setGlobalBackWorked } = useGlobalWorkedMuscles();
  const [workoutName, setWorkoutName] = useState("");
  // Update global worked muscles when stats load
  useEffect(() => {
    if (!stats) return;
    
    const frontWorked: string[] = [];
    const backWorked: string[] = [];
    
    stats.workouts.forEach(workout => {
      if (workout.muscleGroup && MUSCLE_GROUP_MAP[workout.muscleGroup]) {
        MUSCLE_GROUP_MAP[workout.muscleGroup].forEach(muscle => {
          if (muscle.side === 'front' && !frontWorked.includes(muscle.id)) {
            frontWorked.push(muscle.id);
          } else if (muscle.side === 'back' && !backWorked.includes(muscle.id)) {
            backWorked.push(muscle.id);
          }
        });
      }
    });
    
    setGlobalFrontWorked(frontWorked);
    setGlobalBackWorked(backWorked);
  }, [stats, setGlobalFrontWorked, setGlobalBackWorked]);

  if (!stats) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    // TODO: Save workout with name
    navigation.navigate("WorkoutInputMainPage");
  };

  const totalSets = stats.workouts.reduce((total, w) => 
    total + w.sets.filter(set => set.reps && set.weight).length, 0
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <HeaderSection />
        <WorkoutNameInput value={workoutName} onChangeText={setWorkoutName} />
        <StatsGrid
          totalTime={formatTime(stats.totalTime)}
          totalWeight={stats.totalWeight}
          maxLift={stats.maxLift}
          maxLiftExercise={stats.maxLiftExercise}
          totalSets={totalSets}
        />
        <ExercisesSection workouts={stats.workouts} />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes:</Text>
          <TextInput
            placeholder="Enter notes..."
            style={styles.workoutNotesInput}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
             
            <PrimaryButton label="Save Workout Template" variant="default" onPress={() => {}} />
          </View>
          <View style={styles.buttonWrapper}>
            <PrimaryButton label="Save & Continue" variant="default" onPress={handleSave} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  workoutNotesInput: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    minHeight: 120,
    textAlignVertical: "top",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 0,
    marginLeft:20,
  },
});

export default WorkoutStatsPage;

