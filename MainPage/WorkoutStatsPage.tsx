import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStats } from "../Contexts/WorkoutStatsContext";
import { useGlobalWorkedMuscles } from "../Contexts/GlobalWorkedMusclesContext";

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

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.celebrationText}>🎉 Workout Complete! 🎉</Text>
          <Text style={styles.subtitleText}>Great job today!</Text>
        </View>

        {/* Workout Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Name your workout</Text>
          <TextInput
            style={styles.workoutNameInput}
            placeholder="Enter workout name..."
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Time */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={32} color="#202c76" />
            </View>
            <Text style={styles.statValue}>{formatTime(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>

          {/* Total Weight */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="fitness-outline" size={32} color="#202c76" />
            </View>
            <Text style={styles.statValue}>{stats.totalWeight.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Weight (lbs)</Text>
          </View>

          {/* Max Lift */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy-outline" size={32} color="#202c76" />
            </View>
            <Text style={styles.statValue}>{stats.maxLift}</Text>
            <Text style={styles.statLabel}>Max Lift (lbs)</Text>
            <Text style={styles.statSubLabel}>{stats.maxLiftExercise}</Text>
          </View>

          {/* Total Sets */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="list-outline" size={32} color="#202c76" />
            </View>
            <Text style={styles.statValue}>
              {stats.workouts.reduce((total, w) => 
                total + w.sets.filter(set => set.reps && set.weight).length, 0
              )}
            </Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
        </View>

        {/* Exercises Breakdown */}
        <View style={styles.exercisesSection}>
          <Text style={styles.exercisesTitle}>Exercises Completed</Text>
          {stats.workouts
            .filter(w => w.workout)
            .map((workout, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{workout.workout}</Text>
                  <Text style={styles.exerciseMuscleGroup}>{workout.muscleGroup}</Text>
                </View>
                <View style={styles.exerciseSets}>
                  {workout.sets.map((set, setIndex) => (
                    set.reps && set.weight ? (
                      <Text key={setIndex} style={styles.setText}>
                        Set {setIndex + 1}: {set.reps} reps × {set.weight} lbs
                      </Text>
                    ) : null
                  ))}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save & Continue</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#202c76",
    marginBottom: 8,
    marginTop: 50,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
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
  workoutNameInput: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  statSubLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    textAlign: "center",
  },
  exercisesSection: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 16,
  },
  exerciseItem: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: "#666",
  },
  exerciseSets: {
    gap: 4,
  },
  setText: {
    fontSize: 13,
    color: "#666",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#202c76",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WorkoutStatsPage;

