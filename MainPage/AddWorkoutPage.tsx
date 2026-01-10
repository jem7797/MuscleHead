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
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import WorkoutBox from "./AddWorkoutPage Components/WorkoutBox";
import AddWorkoutButton from "./AddWorkoutPage Components/AddWorkoutButton";
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";

// Workout data organized by muscle groups
const WORKOUT_BY_MUSCLE_GROUP: Record<string, string[]> = {
  Chest: ["Bench Press", "Push-ups", "Dumbbell Flyes", "Cable Crossovers", "Incline Bench Press"],
  Arms: ["Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Close-Grip Bench Press", "Overhead Extensions", "Tricep Dips"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Rear Delt Flyes"],
  Back: ["Pull-ups", "Lat Pulldowns", "Barbell Rows", "T-Bar Rows", "Face Pulls"],
  Legs: ["Squats", "Leg Press", "Lunges", "Leg Extensions", "Romanian Deadlifts", "Leg Curls"],
  Glutes: ["Hip Thrusts", "Glute Bridges"],
  Calfs: ["Calf Raises", "Standing Calf Raises", "Seated Calf Raises"],
  Abs: ["Crunches", "Planks", "Leg Raises", "Hanging Knee Raises"],
  Core: ["Russian Twists", "Side Planks", "Cable Woodchoppers", "Hanging Oblique Raises"],
  Traps: ["Shrugs", "Upright Rows"],
};

interface Set {
  reps: string;
  weight: string;
}

interface Workout {
  id: number;
  muscleGroup: string | null;
  workout: string | null;
  sets: Set[];
}

const AddWorkoutPage = () => {
  const navigation = useNavigation<any>();
  const { setStats } = useWorkoutStats();
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: 1, muscleGroup: null, workout: null, sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }] },
    { id: 2, muscleGroup: null, workout: null, sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }] },
    { id: 3, muscleGroup: null, workout: null, sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }] },
  ]);
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [isBack, setIsBack] = useState(false);
  const spinVal = useRef(new Animated.Value(0)).current;
  
  const muscleGroups = Object.keys(WORKOUT_BY_MUSCLE_GROUP);
  
  // Map specific exercises to exact muscles they target (more precise than muscle groups)
  const EXERCISE_TO_MUSCLES: Record<string, { front: string[]; back: string[] }> = {
    // Chest exercises
    "Bench Press": { front: ["chest", "pecs", "triceps"], back: ["triceps"] },
    "Push-ups": { front: ["chest", "pecs", "triceps"], back: ["triceps"] },
    "Dumbbell Flyes": { front: ["chest", "pecs"], back: [] },
    "Cable Crossovers": { front: ["chest", "pecs"], back: [] },
    "Incline Bench Press": { front: ["chest", "pecs", "delts", "triceps"], back: ["triceps"] },
    
    // Arm exercises
    "Barbell Curls": { front: ["biceps"], back: [] },
    "Dumbbell Curls": { front: ["biceps"], back: [] },
    "Hammer Curls": { front: ["biceps"], back: [] },
    "Close-Grip Bench Press": { front: ["triceps"], back: ["triceps"] },
    "Overhead Extensions": { front: ["triceps"], back: ["triceps"] },
    "Tricep Dips": { front: ["triceps"], back: ["triceps"] },
    
    // Shoulder exercises
    "Overhead Press": { front: ["delts", "triceps"], back: ["delts", "triceps"] },
    "Lateral Raises": { front: ["delts"], back: ["delts"] },
    "Front Raises": { front: ["delts"], back: [] },
    "Rear Delt Flyes": { front: [], back: ["delts"] },
    
    // Back exercises
    "Pull-ups": { front: ["biceps"], back: ["lats", "latissimus", "biceps"] },
    "Lat Pulldowns": { front: ["biceps"], back: ["lats", "latissimus", "biceps"] },
    "Barbell Rows": { front: ["biceps"], back: ["lats", "latissimus", "traps", "trapezius"] },
    "T-Bar Rows": { front: ["biceps"], back: ["lats", "latissimus", "traps", "trapezius"] },
    "Face Pulls": { front: [], back: ["delts", "traps", "trapezius"] },
    
    // Leg exercises
    "Squats": { front: ["quads", "quadriceps"], back: ["glutes", "hamstrings"] },
    "Leg Press": { front: ["quads", "quadriceps"], back: ["glutes", "hamstrings"] },
    "Lunges": { front: ["quads", "quadriceps"], back: ["glutes", "hamstrings"] },
    "Leg Extensions": { front: ["quads", "quadriceps"], back: [] },
    "Romanian Deadlifts": { front: [], back: ["hamstrings", "glutes"] },
    "Leg Curls": { front: [], back: ["hamstrings"] },
    
    // Calf exercises
    "Calf Raises": { front: ["calves"], back: ["calves"] },
    "Standing Calf Raises": { front: ["calves"], back: ["calves"] },
    "Seated Calf Raises": { front: ["calves"], back: ["calves"] },
    
    // Glute exercises
    "Hip Thrusts": { front: [], back: ["glutes"] },
    "Glute Bridges": { front: [], back: ["glutes"] },
    
    // Abs/Core exercises
    "Crunches": { front: ["abs"], back: [] },
    "Planks": { front: ["abs"], back: [] },
    "Leg Raises": { front: ["abs"], back: [] },
    "Hanging Knee Raises": { front: ["abs"], back: [] },
    "Russian Twists": { front: ["abs", "obliques"], back: ["obliques"] },
    "Side Planks": { front: ["obliques"], back: ["obliques"] },
    "Cable Woodchoppers": { front: ["abs", "obliques"], back: ["obliques"] },
    "Hanging Oblique Raises": { front: ["obliques"], back: ["obliques"] },
    
    // Trap exercises
    "Shrugs": { front: ["traps", "trapezius"], back: ["traps", "trapezius"] },
    "Upright Rows": { front: ["delts", "traps", "trapezius"], back: ["traps", "trapezius"] },
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
    [spinVal]
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
    const newId = Math.max(...workouts.map(w => w.id), 0) + 1;
    setWorkouts([...workouts, { id: newId, muscleGroup: null, workout: null, sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }] }]);
  };

  const removeWorkout = (id: number) => {
    if (workouts.length > 1) {
      setWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  const updateWorkoutMuscleGroup = (id: number, muscleGroup: string) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, muscleGroup, workout: null } : w));
  };

  const updateWorkoutExercise = (id: number, workout: string) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, workout } : w));
  };

  const addSet = (workoutId: number) => {
    setWorkouts(workouts.map(w => 
      w.id === workoutId ? { ...w, sets: [...w.sets, { reps: "", weight: "" }] } : w
    ));
  };

  const removeSet = (workoutId: number, setIndex: number) => {
    setWorkouts(workouts.map(w => 
      w.id === workoutId && w.sets.length > 1 
        ? { ...w, sets: w.sets.filter((_, i) => i !== setIndex) } 
        : w
    ));
  };

  const updateSet = (workoutId: number, setIndex: number, field: "reps" | "weight", value: string) => {
    setWorkouts(workouts.map(w => {
      if (w.id === workoutId) {
        const newSets = [...w.sets];
        newSets[setIndex][field] = value;
        return { ...w, sets: newSets };
      }
      return w;
    }));
  };

  const handleDone = () => {
    // Calculate stats
    let totalWeight = 0;
    let maxLift = 0;
    let maxLiftExercise = "";
    
    workouts.forEach(workout => {
      workout.sets.forEach(set => {
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerComponent = (
    <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
      <Ionicons name={isTimerRunning ? "pause" : "play"} size={16} color="#202c76" />
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
              <View style={isBack ? styles.backViewWrapper : styles.frontViewWrapper}>
                <WorkedMusclesProvider frontWorked={frontWorked} backWorked={backWorked}>
                  {isBack ? (
                    <MuscleManBack width={130} height={232} />
                  ) : (
                    <MuscleManFront width={130} height={210} />
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
          const availableWorkouts = workoutItem.muscleGroup ? WORKOUT_BY_MUSCLE_GROUP[workoutItem.muscleGroup] : [];
          
          return (
            <WorkoutBox
              key={workoutItem.id}
              workout={workoutItem}
              muscleGroups={muscleGroups}
              availableWorkouts={availableWorkouts}
              canRemove={workouts.length > 1}
              onRemove={() => removeWorkout(workoutItem.id)}
              onSelectMuscleGroup={(group) => updateWorkoutMuscleGroup(workoutItem.id, group)}
              onSelectWorkout={(workout) => updateWorkoutExercise(workoutItem.id, workout)}
              onAddSet={() => addSet(workoutItem.id)}
              onRemoveSet={(index) => removeSet(workoutItem.id, index)}
              onUpdateSet={(index, field, value) => updateSet(workoutItem.id, index, field, value)}
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

