import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  borderSubtle,
  screenBackground,
  surfaceElevated,
  textPrimary,
} from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import MuscleWomanFront from "../Components/MuscleWomanFront";
import MuscleWomanBack from "../Components/MuscleWomanBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import {
  getWorkoutTemplateById,
  type WorkoutTemplateDetail,
  type RoutineExerciseDetail,
} from "../Services/workoutTemplateApi";
import { useMovements } from "../Contexts/MovementContext";
import { EXERCISE_TO_MUSCLES } from "../constants/exerciseToMuscles";

interface SetData {
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseState {
  routineExercise: RoutineExerciseDetail & { exerciseName: string };
  sets: SetData[];
  targetReps: number;
}

const MUSCLE_GROUP_MAP: Record<string, { front: string[]; back: string[] }> = {
  Chest: { front: ["chest", "pecs"], back: [] },
  Shoulders: { front: ["delts"], back: ["delts"] },
  Back: { front: [], back: ["lats", "latissimus"] },
  Triceps: { front: ["triceps"], back: ["triceps"] },
  Biceps: { front: ["biceps"], back: [] },
  Forearms: { front: ["forearms"], back: ["forearms"] },
  Legs: { front: ["quads", "quadriceps"], back: ["hamstrings", "glutes"] },
  Glutes: { front: [], back: ["glutes"] },
  Hamstrings: { front: [], back: ["hamstrings"] },
  Abs: { front: ["abs"], back: [] },
  Core: { front: ["abs"], back: [] },
  Traps: { front: [], back: ["traps", "trapezius"] },
  Calves: { front: ["calves"], back: ["calves"] },
};

/** Normalize template to ExerciseState[]. Handles both routineExercises and exercises formats. */
const buildInitialState = (
  template: WorkoutTemplateDetail,
  movementById: Record<number, string>,
): ExerciseState[] => {
  const defaultSets = template.sets ?? 3;
  const fromRoutine = template.routineExercises ?? [];
  const fromExercises = template.exercises ?? [];

  let items: {
    exerciseId: number;
    orderIndex: number;
    reps: number;
    sets: number;
    name: string;
  }[] = [];

  if (fromRoutine.length > 0) {
    items = fromRoutine
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((re) => ({
        exerciseId: re.exercise?.id ?? re.exerciseId ?? 0,
        orderIndex: re.orderIndex ?? 0,
        reps: re.reps ?? 0,
        sets: re.sets ?? defaultSets,
        name:
          re.exercise?.name ?? movementById[re.exerciseId ?? 0] ?? "Unknown",
      }));
  } else if (fromExercises.length > 0) {
    items = fromExercises
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex ?? 0,
        reps: ex.reps ?? 0,
        sets: ex.sets ?? defaultSets,
        name: movementById[ex.exerciseId] ?? `Exercise #${ex.exerciseId}`,
      }));
  }

  return items.map((item) => ({
    routineExercise: {
      id: item.exerciseId,
      exerciseId: item.exerciseId,
      orderIndex: item.orderIndex,
      reps: item.reps,
      sets: item.sets,
      exercise: { id: item.exerciseId, name: item.name, areaOfActivation: "" },
      exerciseName: item.name,
    } as RoutineExerciseDetail & { exerciseName: string },
    sets: Array.from({ length: item.sets }, () => ({
      weight: "",
      reps: "",
      completed: false,
    })),
    targetReps: item.reps,
  }));
};

const ActiveWorkoutPage = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { gender } = useUser();
  const MuscleFront = gender === "Female" ? MuscleWomanFront : MuscleManFront;
  const MuscleBack = gender === "Female" ? MuscleWomanBack : MuscleManBack;
  const routineId = route.params?.routineId as number | undefined;
  const templateJson = route.params?.templateJson as string | undefined;
  const { movements } = useMovements();

  const movementById = useMemo(() => {
    const map: Record<number, string> = {};
    movements.forEach((m) => {
      map[m.id] = m.name;
    });
    return map;
  }, [movements]);

  const { setStats } = useWorkoutStats();
  const [template, setTemplate] = useState<WorkoutTemplateDetail | null>(null);
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [isBack, setIsBack] = useState(false);
  const spinVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initFromTemplate = (data: WorkoutTemplateDetail) => {
      setTemplate(data);
      setExercises(buildInitialState(data, movementById));
    };

    if (templateJson) {
      try {
        const parsed = JSON.parse(templateJson) as WorkoutTemplateDetail;
        if (
          parsed &&
          ((parsed.routineExercises?.length ?? 0) > 0 ||
            (parsed.exercises?.length ?? 0) > 0)
        ) {
          initFromTemplate(parsed);
          setIsLoading(false);
          return;
        }
      } catch (_) {
        /* fall through */
      }
    }

    if (routineId == null) return;
    let cancelled = false;
    const fetchAndInit = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getWorkoutTemplateById(routineId);
        if (!cancelled) {
          initFromTemplate(data);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Failed to load routine",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchAndInit();
    return () => {
      cancelled = true;
    };
  }, [routineId, templateJson, movementById]);

  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal],
  );

  const handleRotate = () => {
    Animated.sequence([
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(spinVal, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setIsBack((s) => !s);
  };

  useEffect(() => {
    setIsTimerRunning(true);
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps" | "completed",
    value: string | boolean,
  ) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exerciseIndex];
      if (!ex) return prev;
      const newSets = [...ex.sets];
      const s = newSets[setIndex];
      if (!s) return prev;
      if (field === "completed") {
        newSets[setIndex] = { ...s, completed: value as boolean };
      } else {
        newSets[setIndex] = { ...s, [field]: value as string };
      }
      next[exerciseIndex] = { ...ex, sets: newSets };
      return next;
    });
  };

  const currentMaxLift = useMemo(() => {
    let max = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        const w = parseFloat(set.weight) || 0;
        if (w > max) max = w;
      });
    });
    return max;
  }, [exercises]);

  const { frontWorked, backWorked } = useMemo(() => {
    const front: string[] = [];
    const back: string[] = [];
    exercises.forEach((ex) => {
      const name =
        ex.routineExercise.exerciseName ?? ex.routineExercise.exercise?.name;
      const byName = name ? EXERCISE_TO_MUSCLES[name] : undefined;
      if (byName) {
        front.push(...byName.front);
        back.push(...byName.back);
      } else {
        const area = ex.routineExercise.exercise?.areaOfActivation ?? "";
        const mapping = MUSCLE_GROUP_MAP[area];
        if (mapping) {
          front.push(...mapping.front);
          back.push(...mapping.back);
        }
      }
    });
    return {
      frontWorked: Array.from(new Set(front)),
      backWorked: Array.from(new Set(back)),
    };
  }, [exercises]);

  const exerciseName = (ex: ExerciseState) =>
    ex.routineExercise.exerciseName ??
    ex.routineExercise.exercise?.name ??
    "Unknown";

  const handleDone = () => {
    let totalWeight = 0;
    let maxLift = 0;
    let maxLiftExercise = "";

    const workouts = exercises.map((ex, idx) => {
      let exerciseMax = 0;
      ex.sets.forEach((set) => {
        const reps = parseInt(set.reps) || 0;
        const weight = parseFloat(set.weight) || 0;
        totalWeight += reps * weight;
        if (weight > exerciseMax) exerciseMax = weight;
      });
      if (exerciseMax > maxLift) {
        maxLift = exerciseMax;
        maxLiftExercise = exerciseName(ex);
      }
      return {
        id: idx + 1,
        exerciseId:
          ex.routineExercise.exercise?.id ??
          ex.routineExercise.exerciseId ??
          null,
        muscleGroup: ex.routineExercise.exercise?.areaOfActivation ?? null,
        workout: exerciseName(ex),
        sets: ex.sets.map((s) => ({ reps: s.reps, weight: s.weight })),
      };
    });

    setStats({
      workoutName: template?.name ?? "",
      workouts,
      totalTime: timerSeconds,
      totalWeight,
      maxLift,
      maxLiftExercise,
    });
    navigation.navigate("WorkoutStats");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (routineId == null && !templateJson) {
    return (
      <View style={styles.container}>
        <PageHeader title="Active Workout" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No routine selected</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Active Workout" />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </View>
    );
  }

  if (loadError || !template) {
    return (
      <View style={styles.container}>
        <PageHeader title="Active Workout" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {loadError ?? "Failed to load routine"}
          </Text>
        </View>
      </View>
    );
  }

  const timerComponent = (
    <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
      <Ionicons
        name={isTimerRunning ? "pause" : "play"}
        size={16}
        color="#e85d04"
      />
      <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <PageHeader
        title={template.name}
        paddingTop={50}
        paddingHorizontal={16}
        rightComponent={timerComponent}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewSection}>
          <View style={styles.maxLiftContainer}>
            <Text style={styles.maxLiftLabel}>Max Lift</Text>
            <Text style={styles.maxLiftValue}>
              {currentMaxLift > 0 ? `${currentMaxLift} lbs` : "--"}
            </Text>
            {currentMaxLift > 0 && (
              <View style={styles.maxLiftIcon}>
                <Ionicons name="barbell" size={20} color="#e85d04" />
              </View>
            )}
          </View>
          <View style={styles.musclePreviewContainer}>
            <TouchableOpacity
              style={styles.musclePreviewTouchable}
              onPress={handleRotate}
              activeOpacity={0.9}
            >
              <WorkedMusclesProvider
                frontWorked={frontWorked}
                backWorked={backWorked}
              >
                {isBack ? (
                  <MuscleBack width={130} height={232} />
                ) : (
                  <MuscleFront width={130} height={210} />
                )}
              </WorkedMusclesProvider>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={handleRotate}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="swap-horizontal" size={18} color={textPrimary} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {exercises.map((ex, exIndex) => (
          <View
            key={`ex-${exIndex}-${ex.routineExercise.exerciseId ?? exIndex}`}
            style={styles.exerciseSection}
          >
            <Text style={styles.exerciseTitle}>{exerciseName(ex)}</Text>
            {ex.targetReps > 0 && (
              <Text style={styles.targetRepsHint}>
                Target: {ex.targetReps} reps
              </Text>
            )}
            <View style={styles.setsContainer}>
              <View style={styles.setsHeaderRow}>
                <Text style={styles.setHeaderLabel}>Set</Text>
                <Text style={styles.setHeaderInput}>Reps</Text>
                <Text style={styles.setHeaderInput}>Weight (lbs)</Text>
                <View style={styles.checkHeader} />
              </View>
              {ex.sets.map((set, setIndex) => (
                <View key={`set-${setIndex}`} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={ex.targetReps ? String(ex.targetReps) : "Reps"}
                    placeholderTextColor="#8a9bb5"
                    value={set.reps}
                    onChangeText={(t) =>
                      updateSet(exIndex, setIndex, "reps", t)
                    }
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (lbs)"
                    placeholderTextColor="#8a9bb5"
                    value={set.weight}
                    onChangeText={(t) =>
                      updateSet(exIndex, setIndex, "weight", t)
                    }
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit
                  />
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() =>
                      updateSet(exIndex, setIndex, "completed", !set.completed)
                    }
                  >
                    <Ionicons
                      name={
                        set.completed ? "checkmark-circle" : "ellipse-outline"
                      }
                      size={24}
                      color={set.completed ? "#22c55e" : "#8a9bb5"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <PrimaryButton label="Done" variant="footer" onPress={handleDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  container: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: "#c53030",
  },
  loadingText: {
    fontSize: 15,
    color: "#51607a",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  previewSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e6f0",
    overflow: "hidden",
  },
  maxLiftContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
    minWidth: 0,
  },
  maxLiftLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  maxLiftValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e85d04",
  },
  maxLiftIcon: {
    marginTop: 8,
  },
  musclePreviewContainer: {
    width: 150,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: screenBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e6f0",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  musclePreviewTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  rotateButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: surfaceElevated,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: borderSubtle,
    zIndex: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e85d04",
  },
  exerciseSection: {
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 4,
  },
  targetRepsHint: {
    fontSize: 13,
    color: "#51607a",
    marginBottom: 8,
  },
  setsContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  setsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    flex: 1,
    textAlign: "center",
  },
  setHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    width: 56,
  },
  setHeaderInput: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    flex: 1,
    textAlign: "center",
  },
  checkHeader: {
    width: 32,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    width: 56,
  },
  input: {
    flex: 1,
    backgroundColor: screenBackground,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 15,
    color: "#e85d04",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    marginHorizontal: 4,
    textAlign: "center",
  },
  checkButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActiveWorkoutPage;
