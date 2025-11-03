import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";

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
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
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

  return (
    <View style={styles.mainContainer}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2a44" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Workout</Text>
          <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
            <Ionicons name={isTimerRunning ? "pause" : "play"} size={16} color="#202c76" />
            <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {workouts.map((workoutItem) => {
          const availableWorkouts = workoutItem.muscleGroup ? WORKOUT_BY_MUSCLE_GROUP[workoutItem.muscleGroup] : [];
          
          return (
            <View key={workoutItem.id} style={styles.workoutBox}>
              {/* Remove workout button */}
              {workouts.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeWorkout(workoutItem.id)} 
                  style={styles.removeWorkoutButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#888" />
                </TouchableOpacity>
              )}
              
              {/* Muscle Group Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Muscle Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                  {muscleGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[
                        styles.selectorButton,
                        workoutItem.muscleGroup === group && styles.selectorButtonActive,
                      ]}
                      onPress={() => updateWorkoutMuscleGroup(workoutItem.id, group)}
                    >
                      <Text
                        style={[
                          styles.selectorButtonText,
                          workoutItem.muscleGroup === group && styles.selectorButtonTextActive,
                        ]}
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Workout Selection */}
              {workoutItem.muscleGroup && availableWorkouts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Workout</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                    {availableWorkouts.map((workout) => (
                      <TouchableOpacity
                        key={workout}
                        style={[
                          styles.workoutButton,
                          workoutItem.workout === workout && styles.workoutButtonActive,
                        ]}
                        onPress={() => updateWorkoutExercise(workoutItem.id, workout)}
                      >
                        <Text
                          style={[
                            styles.workoutButtonText,
                            workoutItem.workout === workout && styles.workoutButtonTextActive,
                          ]}
                        >
                          {workout}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Sets Input */}
              {workoutItem.workout && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{workoutItem.workout}</Text>
                  
                  <View style={styles.setsContainer}>
                    <View style={styles.setsHeaderRow}>
                      <Text style={styles.setHeaderText}>Set</Text>
                      <Text style={styles.setHeaderText}>Reps</Text>
                      <Text style={styles.setHeaderText}>Weight (lbs)</Text>
                      <View style={styles.setHeaderText} />
                    </View>
                    
                    {workoutItem.sets.map((set, index) => (
                      <View key={index} style={styles.setRow}>
                        <Text style={styles.setNumber}>{index + 1}</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          value={set.reps}
                          onChangeText={(text) => updateSet(workoutItem.id, index, "reps", text)}
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          value={set.weight}
                          onChangeText={(text) => updateSet(workoutItem.id, index, "weight", text)}
                          keyboardType="numeric"
                        />
                        {workoutItem.sets.length > 1 && (
                          <TouchableOpacity onPress={() => removeSet(workoutItem.id, index)} style={styles.removeButton}>
                            <Ionicons name="close" size={18} color="#888" />
                          </TouchableOpacity>
                        )}
                        {workoutItem.sets.length === 1 && <View style={styles.removeButton} />}
                      </View>
                    ))}
                    
                    {/* Add Set Button at bottom */}
                    <TouchableOpacity onPress={() => addSet(workoutItem.id)} style={styles.addSetButtonBottom}>
                      <Ionicons name="add" size={18} color="#202c76" />
                      <Text style={styles.addSetText}>Add Set</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
        
        {/* Add Workout Button */}
        <TouchableOpacity onPress={addWorkout} style={styles.addWorkoutButton}>
          <Ionicons name="add" size={18} color="#888" />
          <Text style={styles.addWorkoutText}>Add Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.doneButtonContainer}>
        <TouchableOpacity 
          onPress={() => {
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
          }} 
          style={styles.doneButton}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 4,
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  workoutBox: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    position: "relative",
  },
  removeWorkoutButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  selectorScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  selectorButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "white",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  selectorButtonActive: {
    backgroundColor: "#202c76",
    borderColor: "#202c76",
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  workoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "white",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  workoutButtonActive: {
    backgroundColor: "#202c76",
    borderColor: "#202c76",
  },
  workoutButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  workoutButtonTextActive: {
    color: "#fff",
  },
  addSetButtonBottom: {
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginTop: 4,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#202c76",
    marginLeft: 4,
  },
  setsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  setsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 15,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    marginHorizontal: 4,
    textAlign: "center",
  },
  removeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  addWorkoutButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  addWorkoutText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  doneButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  doneButton: {
    backgroundColor: "#202c76",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddWorkoutPage;

