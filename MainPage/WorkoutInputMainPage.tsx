import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Button,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";

const { height } = Dimensions.get("window");

const WorkoutInputMainPage = () => {
  const navigation = useNavigation<any>();
  const [isBack, setIsBack] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const spinVal = useRef(new Animated.Value(0)).current;
  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal]
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

  const size = height * 0.4;
  const totalWeightLiftedLbs = 0; // TODO: wire real total weight lifted
  const totalGymMinutes = 0; // TODO: wire real total time in minutes
  const totalHours = Math.floor(totalGymMinutes / 60);
  const totalMinutes = totalGymMinutes % 60;

  const dayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const dayIndex = new Date().getDay(); // 0=Sun ... 6=Sat
  const workoutPlanForDay = (() => {
    switch (dayIndex) {
      case 1: // Monday
        return "Push Day";
      case 2: // Tuesday
        return "Pull Day";
      case 3: // Wednesday
        return "Leg Day";
      case 4: // Thursday
        return "Push Day";
      case 5: // Friday
        return "Pull Day";
      default: // Saturday(6) & Sunday(0)
        return "Off";
    }
  })();

  return (
    <View style={styles.mainContainer}>
      {/* Day title */}
      <Text style={styles.dayTitle}>{dayName}</Text>
      <Text style={styles.daySubtitle}>{workoutPlanForDay}</Text>

      {/* Content layer */}
      <WorkedMusclesProvider frontWorked={[]} backWorked={[]}>
        {isBack ? (
          <View style={styles.muscleManWrapper}>
            <TouchableOpacity
              style={styles.muscleManContainerBack}
              onPress={() => navigation.navigate("MuscleDetail")}
              activeOpacity={0.9}
            >
              <MuscleManBack width={size} height={size} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullscreenIcon}
              onPress={() => navigation.navigate("MuscleDetail")}
              activeOpacity={0.7}
            >
              <Ionicons name="expand" size={16} color="#1f2a44" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.muscleManWrapper}>
            <TouchableOpacity
              style={styles.muscleManContainerFront}
              onPress={() => navigation.navigate("MuscleDetail")}
              activeOpacity={0.9}
            >
              <MuscleManFront width={size} height={size} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullscreenIcon}
              onPress={() => navigation.navigate("MuscleDetail")}
              activeOpacity={0.7}
            >
              <Ionicons name="expand" size={16} color="#1f2a44" />
            </TouchableOpacity>
          </View>
        )}

        {/* Stats row under the muscle man */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Lifetime Weights Lifted</Text>
            <Text style={styles.statValue}>{totalWeightLiftedLbs} lbs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Lifetime Workout Time</Text>
            <Text style={styles.statValue}>{`${totalHours}h ${totalMinutes}m`}</Text>
          </View>
        </View>
        
        {/* Add Workout Button */}  
          <View style={styles.addWorkoutButton}>
            <TouchableOpacity onPress={() => setShowAddMenu((s) => !s)}>
            <Ionicons name="add" color="#fff" size={20} />
          </TouchableOpacity>
            {showAddMenu && (
              <View style={styles.addMenuContainer}>
                <TouchableOpacity style={styles.addMenuItem} onPress={() => {}}>
                  <Text style={styles.addMenuText}>Add Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addMenuItem} onPress={() => {}}>
                  <Text style={styles.addMenuText}>Add Routine</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </WorkedMusclesProvider>

      {/* Overlay UI (NOT inside the scaled container) */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.rotateBtn, { transform: [{ rotate: spin }] }]}
        >
          <TouchableOpacity
            onPress={handleRotate}
            accessibilityRole="button"
            accessibilityLabel="Rotate to front/back view"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="swap-horizontal" size={26} color="#1f2a44" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  dayTitle: {
    textAlign: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 201,
    elevation: 8,
    marginTop: 60,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a44",
  },

  daySubtitle: {
    textAlign: "center",
    color: "#51607a",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
  },

  muscleManWrapper: {
    flex: 0.5,
    position: "relative",
  },

  muscleManContainerFront: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    // keep your scaling only on the SVG area
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },

  muscleManContainerBack: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    // keep your scaling only on the SVG area
    transform: [{ scaleX: 0.8 }, { scaleY: 1.0 }],
  },

  fullscreenIcon: {
    position: "absolute",
    bottom: -120,
    left: 275,
    padding: 6,
    zIndex: 100,
    elevation: 4,
    
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },

    statsRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      paddingHorizontal: 16,
      marginTop: 130,
    },

   

  statCard: {
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    alignItems: "center",
  },

  statLabel: {
    fontSize: 12,
    color: "#51607a",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },

  addWorkoutButton: {
    position: "absolute",
    top: 50,
    left: 20,
    borderRadius: 24,
    color: "black",
    backgroundColor: "#202c76",
    padding: 13,
    zIndex: 400,
    elevation: 8,
  },

  addMenuContainer: {
    position: "absolute",
    left: 56,
    top: -4,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    elevation: 8,
    zIndex: 201,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#e0e6f0",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  addMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  addMenuText: {
    color: "#1f2a44",
    fontSize: 15,
    fontWeight: "500",
  },

  rotateBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#C4C4C4",
    borderRadius: 22,
    padding: 10,
    elevation: 6,
    zIndex: 1200,
  
  },

  workoutButtonText: {
    fontSize: 20,
    fontWeight: "400",
  },
});

export default WorkoutInputMainPage;
