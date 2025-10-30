import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";

const { height } = Dimensions.get("window");

const WorkoutInputMainPage = () => {
  const [isBack, setIsBack] = useState(false);

  const spinVal = useRef(new Animated.Value(0)).current;
  const spin = useMemo(
    () => spinVal.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }),
    [spinVal]
  );

  const handleRotate = () => {
    Animated.sequence([
      Animated.timing(spinVal, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(spinVal, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setIsBack((s) => !s);
  };

  const size = height * 0.4;

  return (
    <View style={styles.mainContainer}>
      {/* Content layer */}
      <WorkedMusclesProvider frontWorked={["biceps"]} backWorked={["lats"]}>
        {isBack ? (
          <View style={styles.muscleManContainerBack} pointerEvents="box-none">
            <MuscleManBack width={size} height={size} />
          </View>
        ) : (
          <View style={styles.muscleManContainerFront} pointerEvents="box-none">
            <MuscleManFront width={size} height={size} />
          </View>
        )}
      </WorkedMusclesProvider>

      {/* Overlay UI (NOT inside the scaled container) */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View style={[styles.rotateBtn, { transform: [{ rotate: spin }] }]}>
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
  muscleManContainerFront: {
    flex: 0.5,
    alignItems: "center",
    paddingTop: 110,
    // keep your scaling only on the SVG area
    transform: [{ scaleX: 1.5 }, { scaleY: 1.2 }],
  },
  muscleManContainerBack: {
    flex: 0.5,
    alignItems: "center",
    paddingTop: 110,
    // keep your scaling only on the SVG area
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // this covers the whole screen above content; we place the button at top-right
    zIndex: 100,
  },
  rotateBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#e8eef9",
    borderRadius: 22,
    padding: 10,
    // ensure visibility on Android
    elevation: 6,
    // ensure visibility on iOS
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default WorkoutInputMainPage;
