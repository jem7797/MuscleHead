import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WorkoutBox from "../MainPage/AddWorkoutPage Components/WorkoutBox";
import AddWorkoutButton from "../MainPage/AddWorkoutPage Components/AddWorkoutButton";
import PrimaryButton from "./PrimaryButton";
import MuscleManFront from "./MuscleManFront";
import MuscleManBack from "./MuscleManBack";
import MuscleWomanFront from "./MuscleWomanFront";
import MuscleWomanBack from "./MuscleWomanBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import { WORKOUT_BY_MUSCLE_GROUP } from "../constants/workoutByMuscleGroup";
import { EXERCISE_TO_MUSCLES } from "../constants/exerciseToMuscles";

export interface WorkoutSet {
  reps: string;
  weight: string;
  completed?: boolean;
}

export interface WorkoutItem {
  id: number;
  exerciseId: number | null;
  muscleGroup: string | null;
  workout: string | null;
  sets: WorkoutSet[];
}

const INITIAL_WORKOUT: WorkoutItem = {
  id: 1,
  exerciseId: null,
  muscleGroup: null,
  workout: null,
  sets: [
    { reps: "", weight: "", completed: false },
    { reps: "", weight: "", completed: false },
    { reps: "", weight: "", completed: false },
  ],
};

interface WorkoutInputSectionProps {
  onDone: (workouts: WorkoutItem[]) => void | Promise<void>;
  /** Optional content to show above the workout input (e.g. logged exercises list) */
  listContent?: React.ReactNode;
  /** When provided, called when user checks a set complete. Used for live sessions to log on check. */
  onSetComplete?: (exerciseName: string, reps: number, weight: number | null) => void | Promise<void>;
}

const WorkoutInputSection: React.FC<WorkoutInputSectionProps> = ({
  onDone,
  listContent,
  onSetComplete,
}) => {
  const { gender } = useUser();
  const MuscleFront = gender === "Female" ? MuscleWomanFront : MuscleManFront;
  const MuscleBack = gender === "Female" ? MuscleWomanBack : MuscleManBack;

  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    { ...INITIAL_WORKOUT },
    { ...INITIAL_WORKOUT, id: 2 },
    { ...INITIAL_WORKOUT, id: 3 },
  ]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [isBack, setIsBack] = useState(false);
  const spinVal = useRef(new Animated.Value(0)).current;

  const muscleGroups = Object.keys(WORKOUT_BY_MUSCLE_GROUP);

  const currentMaxLift = useMemo(() => {
    let max = 0;
    workouts.forEach((workout) => {
      workout.sets.forEach((set) => {
        if (set.weight) {
          const weight = parseFloat(set.weight) || 0;
          if (weight > max) max = weight;
        }
      });
    });
    return max;
  }, [workouts]);

  const { frontWorked, backWorked } = useMemo(() => {
    const front: string[] = [];
    const back: string[] = [];
    workouts.forEach((workout) => {
      if (workout.workout) {
        const m = EXERCISE_TO_MUSCLES[workout.workout];
        if (m) {
          front.push(...m.front);
          back.push(...m.back);
        }
      }
    });
    return {
      frontWorked: Array.from(new Set(front)),
      backWorked: Array.from(new Set(back)),
    };
  }, [workouts]);

  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal]
  );

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
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isTimerRunning]);

  const handleRotate = () => {
    Animated.sequence([
      Animated.timing(spinVal, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(spinVal, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setIsBack((s) => !s);
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const addWorkout = () => {
    const newId = Math.max(...workouts.map((w) => w.id), 0) + 1;
    setWorkouts([
      ...workouts,
      {
        id: newId,
        exerciseId: null,
        muscleGroup: null,
        workout: null,
        sets: [
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false },
        ],
      },
    ]);
  };

  const removeWorkout = (id: number) => {
    if (workouts.length > 1) {
      setWorkouts(workouts.filter((w) => w.id !== id));
    }
  };

  const updateWorkoutMuscleGroup = (id: number, muscleGroup: string) => {
    setWorkouts(
      workouts.map((w) =>
        w.id === id ? { ...w, muscleGroup, workout: null, exerciseId: null } : w
      )
    );
  };

  const updateWorkout = (id: number, workout: string) => {
    setWorkouts(workouts.map((w) => (w.id === id ? { ...w, workout } : w)));
  };

  const addSet = (workoutId: number) => {
    setWorkouts(
      workouts.map((w) =>
        w.id === workoutId
          ? { ...w, sets: [...w.sets, { reps: "", weight: "", completed: false }] }
          : w
      )
    );
  };

  const removeSet = (workoutId: number, setIndex: number) => {
    setWorkouts(
      workouts.map((w) =>
        w.id === workoutId && w.sets.length > 1
          ? { ...w, sets: w.sets.filter((_, i) => i !== setIndex) }
          : w
      )
    );
  };

  const updateSet = (
    workoutId: number,
    setIndex: number,
    field: "reps" | "weight" | "completed",
    value: string | boolean
  ) => {
    setWorkouts(
      workouts.map((w) => {
        if (w.id !== workoutId) return w;
        const newSets = [...w.sets];
        const s = newSets[setIndex];
        if (!s) return w;
        if (field === "completed") {
          const newCompleted = value as boolean;
          newSets[setIndex] = { ...s, completed: newCompleted };
          if (onSetComplete && newCompleted && w.workout) {
            const reps = parseInt(s.reps, 10);
            const weight = s.weight.trim() ? parseFloat(s.weight) : null;
            if (!isNaN(reps) && reps >= 0) {
              onSetComplete(w.workout, reps, weight ?? null);
            }
          }
        } else {
          newSets[setIndex] = { ...s, [field]: value as string };
        }
        return { ...w, sets: newSets };
      })
    );
  };

  const handleDone = async () => {
    await onDone(workouts);
    setWorkouts([
      { ...INITIAL_WORKOUT, id: 1 },
      { ...INITIAL_WORKOUT, id: 2 },
      { ...INITIAL_WORKOUT, id: 3 },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {listContent}

        <View style={styles.previewSection}>
          <View style={styles.timerAndMaxRow}>
            <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
              <Ionicons name={isTimerRunning ? "pause" : "play"} size={16} color="#202c76" />
              <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
            </TouchableOpacity>
            <View style={styles.maxLiftContainer}>
              <Text style={styles.maxLiftLabel}>Max Lift</Text>
              <Text style={styles.maxLiftValue}>
                {currentMaxLift > 0 ? `${currentMaxLift} lbs` : "--"}
              </Text>
              {currentMaxLift > 0 && (
                <View style={styles.maxLiftIcon}>
                  <Ionicons name="barbell" size={20} color="#202c76" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.musclePreviewContainer}>
            <TouchableOpacity
              style={styles.musclePreviewTouchable}
              onPress={handleRotate}
              activeOpacity={0.9}
            >
              <View style={isBack ? styles.backViewWrapper : styles.frontViewWrapper}>
                <WorkedMusclesProvider frontWorked={frontWorked} backWorked={backWorked}>
                  {isBack ? (
                    <MuscleBack width={130} height={232} />
                  ) : (
                    <MuscleFront width={130} height={210} />
                  )}
                </WorkedMusclesProvider>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="swap-horizontal" size={18} color="#202c76" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {workouts.map((workoutItem) => {
          const availableWorkouts = workoutItem.muscleGroup
            ? WORKOUT_BY_MUSCLE_GROUP[workoutItem.muscleGroup] ?? []
            : [];
          return (
            <WorkoutBox
              key={workoutItem.id}
              workout={workoutItem}
              muscleGroups={muscleGroups}
              availableWorkouts={availableWorkouts}
              canRemove={workouts.length > 1}
              onRemove={() => removeWorkout(workoutItem.id)}
              onSelectMuscleGroup={(g) => updateWorkoutMuscleGroup(workoutItem.id, g)}
              onSelectWorkout={(w) => updateWorkout(workoutItem.id, w)}
              onAddSet={() => addSet(workoutItem.id)}
              onRemoveSet={(i) => removeSet(workoutItem.id, i)}
              onUpdateSet={(i, f, v) => updateSet(workoutItem.id, i, f, v as string | boolean)}
            />
          );
        })}

        <AddWorkoutButton onPress={addWorkout} />
      </ScrollView>

      <PrimaryButton label="Done" variant="footer" onPress={handleDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
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
  timerAndMaxRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingRight: 12,
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
  timerText: { fontSize: 13, fontWeight: "500", color: "#202c76" },
  maxLiftContainer: { justifyContent: "center", minWidth: 0 },
  maxLiftLabel: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 4 },
  maxLiftValue: { fontSize: 28, fontWeight: "700", color: "#202c76" },
  maxLiftIcon: { marginTop: 8 },
  musclePreviewContainer: {
    width: 150,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
  frontViewWrapper: { alignItems: "center", justifyContent: "center" },
  backViewWrapper: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scaleX: 0.88 }, { scaleY: 1.1 }],
  },
  rotateButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: "#202c76",
    zIndex: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default WorkoutInputSection;
