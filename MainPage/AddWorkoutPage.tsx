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
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import { useMovements } from "../Contexts/MovementContext";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import WorkoutBox from "./AddWorkoutPage Components/WorkoutBox";
import AddWorkoutButton from "./AddWorkoutPage Components/AddWorkoutButton";
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import MuscleWomanFront from "../Components/MuscleWomanFront";
import MuscleWomanBack from "../Components/MuscleWomanBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import { WORKOUT_BY_MUSCLE_GROUP } from "../constants/workoutByMuscleGroup";

interface ExerciseSet {
  reps: string;
  weight: string;
  completed: boolean;
}

interface SessionInstance {
  id: number;
  exerciseId: number | null;
  muscleGroup: string | null;
  workout: string | null;
  sets: ExerciseSet[];
}

const AddWorkoutPage = () => {
  const navigation = useNavigation<any>();
  const { gender } = useUser();
  const MuscleFront = gender === "Female" ? MuscleWomanFront : MuscleManFront;
  const MuscleBack = gender === "Female" ? MuscleWomanBack : MuscleManBack;
  const { setStats } = useWorkoutStats();
  const { getMovementId, movements } = useMovements();
  const [workouts, setWorkouts] = useState<SessionInstance[]>([
    {
      id: 1,
      exerciseId: null,
      muscleGroup: null,
      workout: null,
      sets: [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
      ],
    },
    {
      id: 2,
      exerciseId: null,
      muscleGroup: null,
      workout: null,
      sets: [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
      ],
    },
    {
      id: 3,
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

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [isBack, setIsBack] = useState(false);
  const spinVal = useRef(new Animated.Value(0)).current;

  const muscleGroups = Object.keys(WORKOUT_BY_MUSCLE_GROUP);

  // Map specific exercises to exact muscles they target (more precise than muscle groups)
  const EXERCISE_TO_MUSCLES: Record<
    string,
    { front: string[]; back: string[] }
  > = {
    // Chest exercises
    "Barbell Bench Press": {
      front: ["chest", "pecs", "triceps", "delts"],
      back: ["triceps"],
    },
    "Dumbbell Bench Press": {
      front: ["chest", "pecs", "triceps", "delts"],
      back: ["triceps"],
    },
    "Incline Bench Press": {
      front: ["chest", "pecs", "delts", "triceps"],
      back: ["triceps"],
    },
    "Decline Bench Press": {
      front: ["chest", "pecs", "triceps", "delts"],
      back: ["triceps"],
    },
    "Push-Ups": {
      front: ["chest", "pecs", "triceps", "delts", "abs"],
      back: ["triceps"],
    },
    "Cable Chest Fly": { front: ["chest", "pecs"], back: [] },
    "Dumbbell Chest Fly": { front: ["chest", "pecs", "delts"], back: [] },
    "Pec Deck Machine": { front: ["chest", "pecs"], back: [] },
    "Chest Press Machine": {
      front: ["chest", "pecs", "triceps", "delts"],
      back: ["triceps"],
    },
    "Pec Fly Machine": { front: ["chest", "pecs"], back: [] },
    "Lat Pullover Machine": {
      front: ["chest", "pecs"],
      back: ["lats", "latissimus"],
    },

    // Bicep exercises
    "Barbell Bicep Curl": { front: ["biceps"], back: [] },
    "Dumbbell Bicep Curl": { front: ["biceps"], back: [] },
    "Hammer Curl": { front: ["biceps", "forearms"], back: [] },
    "Preacher Curl": { front: ["biceps"], back: [] },
    "Concentration Curl": { front: ["biceps"], back: [] },
    "Cable Curl": { front: ["biceps"], back: [] },
    "Incline Dumbbell Curl": { front: ["biceps"], back: [] },
    "EZ Bar Curl": { front: ["biceps", "forearms"], back: [] },

    // Tricep exercises
    "Overhead Tricep Extension (Dumbbell)": {
      front: ["triceps"],
      back: ["triceps"],
    },
    "Overhead Tricep Extension (Cable)": {
      front: ["triceps"],
      back: ["triceps"],
    },
    "Skull Crushers": { front: ["triceps"], back: ["triceps"] },
    "Tricep Kickbacks": { front: ["triceps"], back: ["triceps"] },
    "Close-Grip Bench Press": {
      front: ["triceps", "chest", "pecs", "delts"],
      back: ["triceps"],
    },
    Dips: { front: ["triceps", "chest", "pecs", "delts"], back: ["triceps"] },
    "Machine Tricep Pushdown": { front: ["triceps"], back: ["triceps"] },
    "Rope Tricep Pushdown": { front: ["triceps"], back: ["triceps"] },

    // Shoulder exercises
    "Dumbbell Shoulder Press": {
      front: ["delts", "triceps"],
      back: ["delts", "triceps"],
    },
    "Barbell Shoulder Press (Overhead Press)": {
      front: ["delts", "triceps"],
      back: ["delts", "triceps", "traps", "trapezius"],
    },
    "Arnold Press": { front: ["delts", "triceps"], back: ["delts", "triceps"] },
    "Lateral Raise": { front: ["delts"], back: ["delts"] },
    "Front Raise": { front: ["delts"], back: [] },
    "Rear Delt Fly": { front: [], back: ["delts"] },
    "Cable Lateral Raise": { front: ["delts"], back: ["delts"] },
    "Cable Front Raise": { front: ["delts"], back: [] },
    "Cable Rear Delt Fly": { front: [], back: ["delts", "traps", "trapezius"] },
    "Cable Face Pull with Rope": {
      front: [],
      back: ["delts", "traps", "trapezius"],
    },
    "Shoulder Press Machine": {
      front: ["delts", "triceps"],
      back: ["delts", "triceps"],
    },

    // Back exercises
    "Barbell Row": {
      front: ["biceps"],
      back: ["lats", "latissimus", "traps", "trapezius", "biceps"],
    },
    "Dumbbell Row": {
      front: ["biceps"],
      back: ["lats", "latissimus", "traps", "trapezius", "biceps"],
    },
    "T-Bar Row": {
      front: ["biceps"],
      back: ["lats", "latissimus", "traps", "trapezius", "biceps"],
    },
    "Seated Cable Row": {
      front: ["biceps"],
      back: ["lats", "latissimus", "traps", "trapezius", "biceps"],
    },
    "Lat Pulldown": {
      front: ["biceps"],
      back: ["lats", "latissimus", "biceps"],
    },
    "Pull-Ups": {
      front: ["biceps"],
      back: ["lats", "latissimus", "biceps", "delts", "abs"],
    },
    "Chin-Ups": {
      front: ["biceps", "forearms"],
      back: ["lats", "latissimus", "biceps", "abs"],
    },
    "Inverted Row": {
      front: ["biceps"],
      back: ["lats", "latissimus", "traps", "trapezius", "biceps", "delts"],
    },
    "Face Pulls": { front: [], back: ["delts", "traps", "trapezius"] },

    // Leg exercises
    "Barbell Squat": {
      front: ["quads", "quadriceps", "abs"],
      back: ["glutes", "hamstrings"],
    },
    "Front Squat": { front: ["quads", "quadriceps", "abs"], back: ["glutes"] },
    "Goblet Squat": { front: ["quads", "quadriceps", "abs"], back: ["glutes"] },
    "Sumo Squat": { front: ["quads", "quadriceps"], back: ["glutes"] },
    "Leg Press Machine": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings"],
    },
    "Lunges (Walking)": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings"],
    },
    "Reverse Lunges": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings"],
    },
    "Step-Ups": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings"],
    },
    "Bulgarian Split Squat": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings"],
    },
    "Leg Extension Machine": { front: ["quads", "quadriceps"], back: [] },
    "Hamstring Curl Machine": { front: [], back: ["hamstrings"] },
    "Romanian Deadlift": { front: [], back: ["hamstrings", "glutes"] },
    "Stiff-Leg Deadlift": { front: [], back: ["hamstrings", "glutes"] },
    "Conventional Deadlift": {
      front: [],
      back: ["hamstrings", "glutes", "traps", "trapezius"],
    },
    "Sumo Deadlift": {
      front: ["quads", "quadriceps"],
      back: ["glutes", "hamstrings", "traps", "trapezius"],
    },
    "Jump Squats": {
      front: ["quads", "quadriceps", "calves"],
      back: ["glutes", "hamstrings"],
    },
    "Box Jumps": { front: ["quads", "quadriceps", "calves"], back: ["glutes"] },
    "Leg Curl (Seated)": { front: [], back: ["hamstrings"] },
    "Leg Curl (Lying)": { front: [], back: ["hamstrings"] },

    // Calf exercises
    "Seated Calf Raise": { front: ["calves"], back: ["calves"] },
    "Standing Calf Raise": { front: ["calves"], back: ["calves"] },
    "Donkey Calf Raise": { front: ["calves"], back: ["calves"] },

    // Glute exercises
    "Hip Thrust": { front: [], back: ["glutes", "hamstrings", "abs"] },
    "Glute Bridge": { front: [], back: ["glutes", "hamstrings", "abs"] },

    // Abs/Core exercises
    Plank: { front: ["abs"], back: [] },
    "Side Plank": { front: ["obliques"], back: ["obliques"] },
    "Hanging Leg Raise": { front: ["abs"], back: [] },
    "Cable Crunch": { front: ["abs"], back: [] },
    "Ab Wheel Rollout": { front: ["abs"], back: [] },
    "Russian Twist": { front: ["abs", "obliques"], back: ["obliques"] },
    "Bicycle Crunch": { front: ["abs", "obliques"], back: [] },
    "Mountain Climbers": { front: ["abs"], back: [] },
    "Reverse Crunch": { front: ["abs"], back: [] },
    "Sit-Ups": { front: ["abs"], back: [] },
    "Flutter Kicks": { front: ["abs"], back: [] },
    "Back Extension": { front: [], back: ["glutes", "hamstrings"] },
    "Good Mornings": { front: [], back: ["hamstrings", "glutes"] },

    // Full body/Core exercises
    "Kettlebell Swing": {
      front: ["abs"],
      back: ["glutes", "hamstrings", "delts"],
    },
    "Farmer's Carry": {
      front: ["forearms", "abs"],
      back: ["traps", "trapezius"],
    },
    "Suitcase Carry": { front: ["obliques", "forearms"], back: [] },
    "Sled Push": {
      front: ["quads", "quadriceps", "calves", "abs"],
      back: ["glutes"],
    },
    "Sled Pull": { front: [], back: ["hamstrings", "glutes", "calves", "abs"] },
    "Rowing Machine": {
      front: ["biceps", "abs"],
      back: ["lats", "latissimus", "biceps"],
    },
    "Jump Rope": {
      front: ["calves", "quads", "quadriceps", "delts"],
      back: [],
    },
    "Running on Treadmill": {
      front: ["quads", "quadriceps"],
      back: ["glutes"],
    },
    "Incline Treadmill Walk": {
      front: ["quads", "quadriceps", "calves"],
      back: ["glutes"],
    },
    "Stationary Bike": {
      front: ["quads", "quadriceps", "calves"],
      back: ["hamstrings"],
    },
    Elliptical: { front: ["quads", "quadriceps", "delts"], back: ["glutes"] },
    Burpees: {
      front: ["chest", "pecs", "quads", "quadriceps", "abs", "delts"],
      back: [],
    },
    "Medicine Ball Slam": { front: ["abs", "delts"], back: [] },

    // Trap exercises
    Shrugs: { front: ["traps", "trapezius"], back: ["traps", "trapezius"] },
    "Upright Row": {
      front: ["delts", "traps", "trapezius", "biceps"],
      back: ["traps", "trapezius"],
    },
  };

  // Calculate current max lift weight from all workouts
  const currentMaxLift = useMemo(() => {
    let max = 0;
    workouts.forEach((workout) => {
      workout.sets.forEach((set) => {
        if (set.weight) {
          const weight = parseFloat(set.weight) || 0;
          if (weight > max) {
            max = weight;
          }
        }
      });
    });
    return max;
  }, [workouts]);

  // Get worked muscles from specific exercises (more precise than muscle groups)
  const { frontWorked, backWorked } = useMemo(() => {
    const front: string[] = [];
    const back: string[] = [];

    // Only highlight if a specific exercise is selected (not just muscle group)
    workouts.forEach((workout) => {
      if (workout.workout) {
        const exerciseMuscles = EXERCISE_TO_MUSCLES[workout.workout];
        if (exerciseMuscles) {
          front.push(...exerciseMuscles.front);
          back.push(...exerciseMuscles.back);
        }
      }
    });

    return {
      frontWorked: Array.from(new Set(front)),
      backWorked: Array.from(new Set(back)),
    };
  }, [workouts]);

  // Spin animation for rotation
  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal],
  );

  // Handle rotation toggle
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

  // Start timer on mount
  useEffect(() => {
    setIsTimerRunning(true);
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

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
        w.id === id
          ? { ...w, muscleGroup, workout: null, exerciseId: null }
          : w,
      ),
    );
  };

  const updateSessionInstance = (id: number, workout: string) => {
    const exerciseId = getMovementId(workout) ?? null;
    const movement = movements.find(
      (m) =>
        m.id === exerciseId ||
        m.name.toLowerCase().trim() === workout.toLowerCase().trim(),
    );
    console.log(
      "[AddWorkout] selected:",
      workout,
      "| exerciseId:",
      exerciseId,
      "| areaOfActivation:",
      movement?.areaOfActivation ?? "N/A",
    );
    setWorkouts(
      workouts.map((w) => (w.id === id ? { ...w, workout, exerciseId } : w)),
    );
  };

  const addSet = (workoutId: number) => {
    setWorkouts(
      workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              sets: [...w.sets, { reps: "", weight: "", completed: false }],
            }
          : w,
      ),
    );
  };

  const removeSet = (workoutId: number, setIndex: number) => {
    setWorkouts(
      workouts.map((w) =>
        w.id === workoutId && w.sets.length > 1
          ? { ...w, sets: w.sets.filter((_, i) => i !== setIndex) }
          : w,
      ),
    );
  };

  const updateSet = (
    workoutId: number,
    setIndex: number,
    field: "reps" | "weight" | "completed",
    value: string | boolean,
  ) => {
    setWorkouts(
      workouts.map((w) => {
        if (w.id === workoutId) {
          const newSets = [...w.sets];
          const s = newSets[setIndex];
          if (s) {
            if (field === "completed") {
              newSets[setIndex] = { ...s, completed: value as boolean };
            } else {
              newSets[setIndex] = { ...s, [field]: value as string };
            }
          }
          return { ...w, sets: newSets };
        }
        return w;
      }),
    );
  };

  const handleDone = () => {
    // Calculate stats
    let totalWeight = 0;
    let maxLift = 0;
    let maxLiftExercise = "";

    workouts.forEach((workout) => {
      workout.sets.forEach((set) => {
        if (set.reps && set.weight) {
          const reps = parseInt(set.reps) || 0;
          const weight = parseFloat(set.weight) || 0;
          totalWeight += reps * weight;

          if (weight > maxLift) {
            maxLift = weight;
            maxLiftExercise = workout.workout || "";
          }
        }
      });
    });

    setStats({
      workoutName: "",
      workouts: workouts,
      totalTime: timerSeconds,
      totalWeight: totalWeight,
      maxLift: maxLift,
      maxLiftExercise: maxLiftExercise,
    });

    navigation.navigate("WorkoutStats");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const timerComponent = (
    <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
      <Ionicons
        name={isTimerRunning ? "pause" : "play"}
        size={16}
        color="#202c76"
      />
      <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <PageHeader
        title="Add Workout"
        paddingTop={50}
        paddingHorizontal={16}
        rightComponent={timerComponent}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Max Lift and Muscle Preview Section */}
        <View style={styles.previewSection}>
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

          <View style={styles.musclePreviewContainer}>
            <TouchableOpacity
              style={styles.musclePreviewTouchable}
              onPress={handleRotate}
              activeOpacity={0.9}
            >
              <View
                style={
                  isBack ? styles.backViewWrapper : styles.frontViewWrapper
                }
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
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={handleRotate}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="swap-horizontal" size={18} color="#202c76" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {workouts.map((workoutItem) => {
          const availableWorkouts = workoutItem.muscleGroup
            ? WORKOUT_BY_MUSCLE_GROUP[workoutItem.muscleGroup]
            : [];

          return (
            <WorkoutBox
              key={workoutItem.id}
              workout={workoutItem}
              muscleGroups={muscleGroups}
              availableWorkouts={availableWorkouts}
              canRemove={workouts.length > 1}
              onRemove={() => removeWorkout(workoutItem.id)}
              onSelectMuscleGroup={(group) =>
                updateWorkoutMuscleGroup(workoutItem.id, group)
              }
              onSelectWorkout={(workout) =>
                updateSessionInstance(workoutItem.id, workout)
              }
              onAddSet={() => addSet(workoutItem.id)}
              onRemoveSet={(index) => removeSet(workoutItem.id, index)}
              onUpdateSet={(index, field, value) =>
                updateSet(
                  workoutItem.id,
                  index,
                  field,
                  value as string | boolean,
                )
              }
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
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
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
    color: "#202c76",
  },
  maxLiftIcon: {
    marginTop: 8,
  },
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
  frontViewWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
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
    color: "#202c76",
  },
});

export default AddWorkoutPage;
