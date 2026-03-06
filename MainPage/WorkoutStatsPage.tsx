import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Text,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import { useMovements } from "../Contexts/MovementContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import HeaderSection from "./WorkoutStatsPage Components/HeaderSection";
import WorkoutNameInput from "./WorkoutStatsPage Components/WorkoutNameInput";
import StatsGrid from "./WorkoutStatsPage Components/StatsGrid";
import ExercisesSection from "./WorkoutStatsPage Components/ExercisesSection";
import PrimaryButton from "../Components/PrimaryButton";
import { createSessionLog } from "../Services/sessionLogApi";
import { useAchievement } from "../Contexts/AchievementContext";

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
  const { stats, setStats } = useWorkoutStats();
  const { getMovementId } = useMovements();
  const { setGlobalFrontWorked, setGlobalBackWorked } = useGlobalWorkedMuscles();
  const { addToLifetimeStats } = useUser();
  const { addMedalsFromWorkout } = useAchievement();
  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!stats) return;
    setSaving(true);
    try {
      const completedWorkouts = stats.workouts.filter(
        (w) =>
          w.workout &&
          w.sets.some((s) => s.reps && s.weight)
      );
      const exercises = completedWorkouts
        .map((w) => {
          const exerciseId = w.exerciseId ?? (w.workout ? getMovementId(w.workout) : undefined);
          if (exerciseId == null) return null;
          const completedSets = w.sets.filter((s) => s.reps && s.weight);
          const lastSet = completedSets[completedSets.length - 1];
          return {
            exerciseId,
          sets: completedSets.length,
          reps: lastSet ? parseInt(lastSet.reps, 10) || 0 : 0,
          weight: lastSet ? parseFloat(lastSet.weight) || 0 : 0,
          notes: "",
          };
        })
        .filter((e): e is NonNullable<typeof e> => e != null);

      if (completedWorkouts.length > 0 && exercises.length === 0) {
        Alert.alert(
          "Could not save exercises",
          "Your exercises could not be matched to the server. Check that movements loaded (you may be offline) and that exercise names match the server."
        );
        setSaving(false);
        return;
      }

      const sessionLogData: {
        notes?: string;
        routineId?: number;
        timeSpentInGym: number;
        exercises: { exerciseId: number; sets: number; reps: number; weight: number; notes?: string }[];
      } = {
        timeSpentInGym: stats.totalTime,
        exercises,
      };
      if (notes.trim()) sessionLogData.notes = notes.trim();
      const response = await createSessionLog(sessionLogData);
      if (response.newlyAwardedMedals?.length > 0) {
        await addMedalsFromWorkout(response.newlyAwardedMedals);
        // Defer navigation so the achievement queue is committed before the new screen mounts
        requestAnimationFrame(() => {
          navigation.navigate("WorkoutInputMainPage");
        });
      } else {
        navigation.navigate("WorkoutInputMainPage");
      }
      addToLifetimeStats(stats.totalWeight, stats.totalTime / 60);
      setStats(null);
    } catch (e) {
      Alert.alert(
        "Save failed",
        "Could not save workout. Please try again."
      );
    } finally {
      setSaving(false);
    }
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
            value={notes}
            onChangeText={setNotes}
            editable={!saving}
          />
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
             
            <PrimaryButton label="Save Workout Template" variant="default" onPress={() => {}} />
          </View>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              label={saving ? "Saving..." : "Save & Continue"}
              variant="default"
              onPress={handleSave}
              disabled={saving}
            />
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
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 7,
  },
  buttonWrapper: {
    flex: 0,
    marginLeft:20,
  },
});

export default WorkoutStatsPage;

