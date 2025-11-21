import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import WorkoutBox from "./AddWorkoutPage Components/WorkoutBox";
import AddWorkoutButton from "./AddWorkoutPage Components/AddWorkoutButton";

// Workout data organized by muscle groups
const WORKOUT_BY_MUSCLE_GROUP: Record<string, string[]> = {
  Chest: ["Bench Press", "Push-ups", "Dumbbell Flyes", "Cable Crossovers", "Incline Bench Press"],
  Arms: ["Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Close-Grip Bench Press", "Overhead Extensions", "Tricep Dips"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Rear Delt Flyes"],
  Back: ["Pull-ups", "Lat Pulldowns", "Barbell Rows", "T-Bar Rows"],
  Legs: ["Squats", "Leg Press", "Lunges", "Leg Extensions", "Romanian Deadlifts", "Leg Curls"],
  Glutes: ["Hip Thrusts", "Glute Bridges"],
  Calves: ["Calf Raises", "Standing Calf Raises", "Seated Calf Raises"],
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
  
  const muscleGroups = Object.keys(WORKOUT_BY_MUSCLE_GROUP);
  
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
    paddingBottom: 40,
    flexGrow: 1,
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

