import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  borderSubtle,
  screenBackground,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import {
  getWorkoutTemplateById,
  deleteWorkoutTemplate,
  WorkoutTemplateDetail,
} from "../Services/workoutTemplateApi";
import { useMovements } from "../Contexts/MovementContext";
import { useRoutines } from "../Contexts/RoutinesContext";
import { clearSoloWorkoutTimer, SOLO_TIMER_KEYS } from "../Services/soloWorkoutTimerStorage";

/** Normalize template to list of { name, reps, sets } for display */
const getDisplayExercises = (
  template: WorkoutTemplateDetail | null,
  movementById: Record<number, string>
): { name: string; reps: number; sets: number }[] => {
  if (!template) return [];
  const defaultSets = template.sets ?? 3;
  const fromRoutine = template.routineExercises ?? [];
  if (fromRoutine.length > 0) {
    return fromRoutine
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((re) => ({
        name: re.exercise?.name ?? movementById[re.exerciseId ?? 0] ?? "Unknown",
        reps: re.reps ?? 0,
        sets: re.sets ?? defaultSets,
      }));
  }
  const fromExercises = template.exercises ?? [];
  return fromExercises
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((ex) => ({
      name: movementById[ex.exerciseId] ?? `Exercise #${ex.exerciseId}`,
      reps: ex.reps ?? 0,
      sets: ex.sets ?? defaultSets,
    }));
};

const RoutineDetailPage = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routineId = route.params?.routineId as number | undefined;
  const { movements } = useMovements();
  const { removeRoutine } = useRoutines();
  const [isDeleting, setIsDeleting] = useState(false);

  const movementById = useMemo(() => {
    const map: Record<number, string> = {};
    movements.forEach((m) => {
      map[m.id] = m.name;
    });
    return map;
  }, [movements]);

  const [template, setTemplate] = useState<WorkoutTemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routineId == null) return;
    let cancelled = false;
    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWorkoutTemplateById(routineId);
        if (!cancelled) {
          setTemplate(data);
        }
      } catch (e) {
        if (!cancelled) {
          const status = (e as any)?.status;
          if (status === 404) {
            removeRoutine(routineId);
            navigation.goBack();
            return;
          }
          setError(e instanceof Error ? e.message : "Failed to load routine");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchTemplate();
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  if (routineId == null) {
    return (
      <View style={styles.container}>
        <PageHeader title="Routine" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Invalid routine</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Routine" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#e85d04" />
          <Text style={styles.loadingText}>Loading routine...</Text>
        </View>
      </View>
    );
  }

  if (error || !template) {
    return (
      <View style={styles.container}>
        <PageHeader title="Routine" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error ?? "Routine not found"}</Text>
        </View>
      </View>
    );
  }

  const displayExercises = getDisplayExercises(template, movementById);

  const handleBeginWorkout = async () => {
    await clearSoloWorkoutTimer(SOLO_TIMER_KEYS.activeRoutine(template!.id));
    navigation.navigate("ActiveWorkout", {
      routineId: template!.id,
      templateJson: JSON.stringify(template),
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteWorkoutTemplate(template.id);
              removeRoutine(template.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert(
                "Delete failed",
                e instanceof Error ? e.message : "Could not delete routine. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const deleteButton = (
    <TouchableOpacity
      onPress={handleDelete}
      disabled={isDeleting}
      style={styles.deleteButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name="trash-outline"
        size={22}
        color={isDeleting ? textSecondary : "#c53030"}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader title={template.name} rightComponent={deleteButton} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayExercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises in this routine</Text>
        ) : (
          displayExercises.map((ex, index) => (
            <View key={`${ex.name}-${index}`} style={styles.exerciseRow}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.setsReps}>
                  {ex.sets} sets
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <PrimaryButton
        label="Begin Workout"
        variant="footer"
        onPress={handleBeginWorkout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: "#c53030",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: textSecondary,
    textAlign: "center",
    paddingVertical: 32,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: borderSubtle,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: textSecondary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: textPrimary,
    marginBottom: 2,
  },
  areaText: {
    fontSize: 13,
    color: textSecondary,
    marginBottom: 4,
  },
  setsReps: {
    fontSize: 14,
    color: textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
});

export default RoutineDetailPage;
