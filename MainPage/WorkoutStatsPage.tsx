import React, { useState } from "react";
import * as Haptics from "expo-haptics";
import { Video, ResizeMode } from "expo-av";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Text,
  Alert,
  Dimensions,
} from "react-native";
import {
  borderSubtle,
  screenBackground,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import { useMovements } from "../Contexts/MovementContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import HeaderSection from "./WorkoutStatsPage Components/HeaderSection";
import StatsGrid from "./WorkoutStatsPage Components/StatsGrid";
import ExercisesSection from "./WorkoutStatsPage Components/ExercisesSection";
import PrimaryButton from "../Components/PrimaryButton";
import { createSessionLog } from "../Services/sessionLogApi";
import { useAchievement } from "../Contexts/AchievementContext";
import { postWorkedMuscles } from "../Services/workedMusclesApi";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/** Dark scrim over fireworks so cards/text stay readable (matches cool grey base). */
const FIREWORKS_SCRIM = "rgba(53, 56, 64, 0.72)";

const WorkoutStatsPage = () => {
  const navigation = useNavigation<any>();
  const { stats, setStats } = useWorkoutStats();
  const { getMovementId, movements, loading: movementsLoading } = useMovements();
  const { refreshWorkedMuscles } = useGlobalWorkedMuscles();
  const { addToLifetimeStats } = useUser();
  const { addMedalsFromWorkout } = useAchievement();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
        const reason = movementsLoading
          ? "Movements are still loading. Please wait a moment and try again."
          : movements.length === 0
            ? "Could not load exercises from the server. Check your connection and try again."
            : "Exercise names could not be matched. The server may use different names than the app.";
        Alert.alert("Could not save exercises", reason);
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
      if (exercises.length > 0) {
        postWorkedMuscles(exercises).then(() => {
          refreshWorkedMuscles();
        });
      }
      if (response.newlyAwardedMedals?.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        await addMedalsFromWorkout(response.newlyAwardedMedals);
        // Defer navigation so the achievement queue is committed before the new screen mounts
        requestAnimationFrame(() => {
          navigation.navigate("WorkoutInputMainPage");
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
      <Video
        source={require("../assets/MutedFireworks.mp4")}
        style={styles.fireworksVideo}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
      <View style={styles.fireworksScrim} pointerEvents="none" />

      <View style={styles.foreground}>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <HeaderSection />
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
              placeholderTextColor={textSecondary}
              style={styles.workoutNotesInput}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              editable={!saving}
              returnKeyType="done"
              blurOnSubmit
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
                disabled={saving || movementsLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: screenBackground,
    position: "relative",
  },
  fireworksVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  fireworksScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FIREWORKS_SCRIM,
  },
  foreground: {
    flex: 1,
    zIndex: 1,
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
    color: textPrimary,
    marginBottom: 8,
  },
  workoutNotesInput: {
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: textPrimary,
    borderWidth: 1,
    borderColor: borderSubtle,
    minHeight: 120,
    textAlignVertical: "top",
  },
  footerContainer: {
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: borderSubtle,
    backgroundColor: "rgba(53, 56, 64, 0.92)",
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

