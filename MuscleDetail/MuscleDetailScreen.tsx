// React core imports
import React, { useMemo, useRef, useState } from "react";
// React Native UI components
import {
  StyleSheet, // For creating stylesheets
  View, // Container component (like div in web)
  Dimensions, // Gets screen width/height
  TouchableOpacity, // Button-like component that responds to touch
  Animated, // For animations
  Text, // Text display component
  ScrollView, // Scrollable container for content that overflows
} from "react-native";
// Icon library
import { Ionicons } from "@expo/vector-icons";
// Navigation hook to go back to previous screen
import { useNavigation } from "@react-navigation/native";
// Our custom muscle SVG components
import MuscleManFront from "../Components/MuscleManFront";
import MuscleManBack from "../Components/MuscleManBack";
import MuscleWomanFront from "../Components/MuscleWomanFront";
import MuscleWomanBack from "../Components/MuscleWomanBack";
// Context provider that manages which muscles should be highlighted
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";
import { useUser } from "../Contexts/UserContext";
import PageHeader from "../Components/PageHeader";
import InfoPanel from "./MuscleDetailScreen Components/InfoPanel";
import MuscleSelector from "./MuscleDetailScreen Components/MuscleSelector";

// Get screen dimensions once - used for responsive sizing
const { height, width } = Dimensions.get("window");

// Dictionary storing muscle information - maps muscle ID to name, description, and exercise list
// Used to display info when user selects a muscle
const MUSCLE_INFO: Record<
  string,
  { name: string; subname: string; description: string; exercises: string[] }
> = {
  pecs: {
    name: "Pecs",
    subname: "Pectoralis Major & Minor",
    description:
      "Engineered for power, every fiber of the chest drives presses, pushes, and punches — the upper body's torque center.",
    exercises: [
      "Bench Press",
      "Push-ups",
      "Dumbbell Flyes",
      "Cable Crossovers",
    ],
  },
  biceps: {
    name: "Biceps",
    subname: "Biceps Brachii",
    description:
      "Two heads, one purpose — to pull. The biceps flex the elbow and twist the forearm, defining every strong grip and curl.",
    exercises: [
      "Barbell Curls",
      "Dumbbell Curls",
      "Hammer Curls",
      "Cable Curls",
    ],
  },
  triceps: {
    name: "Triceps",
    subname: "Triceps Brachii",
    description:
      "The unsung heavy lifters of the arm — three powerful heads forming two-thirds of your arm's mass, built to drive every press and lockout.",
    exercises: [
      "Close-Grip Bench Press",
      "Overhead Extensions",
      "Tricep Dips",
      "Pushdowns",
    ],
  },
  forearms: {
    name: "Forearms",
    subname: "Flexor & Extensor Carpi",
    description:
      "The crux of every pull — forearms stabilize lifts, control rotations, and deliver raw grip strength. Inner and outer muscles working in unison to transfer force.",
    exercises: [
      "Wrist Curls",
      "Reverse Wrist Curls",
      "Farmer's Walks",
      "Hammer Curls",
    ],
  },
  delts: {
    name: "Delts",
    subname: "Deltoideus",
    description:
      "Three heads working as one dynamic system. The delts power every lift, twist, and reach, stabilizing the shoulder like a finely tuned suspension built for motion in every plane.",
    exercises: [
      "Overhead Press",
      "Lateral Raises",
      "Front Raises",
      "Rear Delt Flyes",
    ],
  },
  lats: {
    name: "Lats",
    subname: "Latissimus Dorsi",
    description:
      "Wide, powerful, unmistakable — the lats pull the arms down and back, sculpting that signature V-taper and anchoring your upper body strength.",
    exercises: ["Pull-ups", "Lat Pulldowns", "Barbell Rows", "T-Bar Rows"],
  },
  quads: {
    name: "Quads",
    subname: "Quadriceps Femoris",
    description:
      "Acceleration, climb, control — four powerhouse muscles turning every stride into raw forward motion. The quads extend the knee, stabilize the body, and drive dominance from the front of the thigh.",
    exercises: ["Squats", "Leg Press", "Lunges", "Leg Extensions"],
  },
  hamstrings: {
    name: "Hamstrings",
    subname: "Biceps Femoris, Semitendinosus, Semimembranosus",
    description:
      "A trio of muscles running the back of the thigh — built for sprint recovery, explosive speed, and balance. Where sprint speed and stability are forged.",
    exercises: [
      "Romanian Deadlifts",
      "Leg Curls",
      "Good Mornings",
      "Stiff-Leg Deadlifts",
    ],
  },
  glutes: {
    name: "Glutes",
    subname: "Gluteus Maximus, Medius & Minimus",
    description:
      "Three gluteal muscles working as one powerhouse — the drivers of hip thrust, rotation, and control. The workhorses of nearly all lower body movements.",
    exercises: ["Hip Thrusts", "Squats", "Romanian Deadlifts", "Glute Bridges"],
  },
  calves: {
    name: "Calves",
    subname: "Gastrocnemius & Soleus",
    description:
      "Muscles for launch — the calves drive propulsion, stabilize the stride, and add spring to every step.",
    exercises: [
      "Calf Raises",
      "Standing Calf Raises",
      "Seated Calf Raises",
      "Jump Rope",
    ],
  },
  abs: {
    name: "Abs",
    subname: "Rectus Abdominis",
    description:
      "Front-line stability — the abs flex the spine, brace the torso, and link upper and lower power. Every lift begins here.",
    exercises: ["Crunches", "Planks", "Leg Raises", "Hanging Knee Raises"],
  },
  obliques: {
    name: "Obliques",
    subname: "External & Internal Obliques",
    description:
      "Twin sets of angled muscles guarding your core — the obliques twist, bend, and resist torque, giving structure to every turn and pivot.",
    exercises: [
      "Russian Twists",
      "Side Planks",
      "Cable Woodchoppers",
      "Hanging Oblique Raises",
    ],
  },
  traps: {
    name: "Traps",
    subname: "Trapezius",
    description:
      "A three-tiered muscle running from neck to spine — the traps lift, pull, and stabilize with silent dominance, commanding posture and power.",
    exercises: ["Shrugs", "Upright Rows", "Face Pulls", "High Pulls"],
  },
};

const MuscleDetailScreen = () => {
  // Navigation hook - allows going back to previous screen
  const navigation = useNavigation();
  const { gender } = useUser();
  const MuscleFront = gender === "Female" ? MuscleWomanFront : MuscleManFront;
  const MuscleBack = gender === "Female" ? MuscleWomanBack : MuscleManBack;

  // State: tracks whether showing front (false) or back (true) view
  const [isBack, setIsBack] = useState(false);

  // State: stores the currently selected muscle ID, or null if none selected
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Animation value: starts at 0, animates to 1 during flip animation
  // useRef creates a persistent value that doesn't re-render component when changed
  const spinVal = useRef(new Animated.Value(0)).current;

  // useMemo caches the interpolation so it doesn't recalculate on every render
  // Interpolates: 0 -> "0deg", 1 -> "180deg" for rotation animation
  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal],
  );

  // Handler for flip button - rotates between front and back views
  const handleRotate = () => {
    // Animated.sequence runs animations one after another
    Animated.sequence([
      // First: animate from 0 to 1 over 180ms (half rotation)
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true, // Uses native thread for better performance
      }),
      // Second: instantly reset to 0 (no duration = instant)
      Animated.timing(spinVal, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    // Toggle front/back state after animation
    setIsBack((s) => !s);
    // Clear selection when flipping
  };

  // Calculate SVG size: takes 70% of screen height OR 90% of width, whichever is smaller
  // This ensures the muscle man fits on screen regardless of device orientation
  const size = Math.min(height * 0.7, width * 0.9);

  // Handler: when user taps a muscle button in the selector
  // Toggles selection - if same muscle clicked again, deselects it
  const handleMuscleClick = (muscleId: string) => {
    if (selectedMuscle === muscleId) {
      // If already selected, deselect it
      setSelectedMuscle(null);
    } else {
      // Otherwise, select the new muscle
      setSelectedMuscle(muscleId);
    }
  };

  // Lookup: get info object for currently selected muscle (or null)
  const selectedInfo = selectedMuscle ? MUSCLE_INFO[selectedMuscle] : null;

  // Array of muscle IDs to pass to context for highlighting
  const workedMuscles = selectedMuscle ? [selectedMuscle] : [];

  // Main render - returns the component UI
  return (
    <View style={styles.container}>
      <PageHeader title="Muscle Guide" />

      {/* Context provider - supplies worked muscles for highlighting */}
      <WorkedMusclesProvider
        frontWorked={isBack ? [] : workedMuscles}
        backWorked={isBack ? workedMuscles : []}
      >
        {/* Container for muscle SVG - centers it */}
        <View style={styles.muscleContainer}>
          {isBack ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.muscleWrapperBack}
            >
              <MuscleBack
                width={size}
                height={size}
                worked={workedMuscles}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.muscleWrapperFront}
            >
              <MuscleFront
                width={size}
                height={size}
                worked={workedMuscles}
              />
            </TouchableOpacity>
          )}
        </View>
      </WorkedMusclesProvider>

      {/* Flip button - positioned absolutely */}
      <View style={styles.controls}>
        <Animated.View
          style={[styles.rotateBtn, { transform: [{ rotate: spin }] }]}
        >
          <TouchableOpacity
            onPress={handleRotate}
            accessibilityRole="button"
            accessibilityLabel="Flip to front/back view"
          >
            <Ionicons name="swap-horizontal" size={26} color="#1f2a44" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {selectedInfo && <InfoPanel info={selectedInfo} />}
      <MuscleSelector
        muscles={MUSCLE_INFO}
        selectedMuscle={selectedMuscle}
        onSelect={handleMuscleClick}
      />
    </View>
  );
};

// StyleSheet: Defines all visual styles for the component
const styles = StyleSheet.create({
  // Main container - fills entire screen
  container: {
    flex: 1, // Takes up all available space (100% height)
    backgroundColor: "#fff", // White background
  },

  // Header bar at top of screen
  header: {
    flexDirection: "row", // Arranges children horizontally (back button, title, placeholder)
    alignItems: "center", // Vertically centers all children
    justifyContent: "space-between", // Puts max space between children (left, center, right)
    paddingHorizontal: 20, // 20px padding on left and right sides
    paddingTop: 50, // 50px from top (accounts for status bar/notch on phones)
    paddingBottom: 16, // 16px padding below header
  },

  // Back button styling
  backButton: {
    padding: 8, // 8px padding all around - makes touch target larger
  },

  // Header title text styling
  headerTitle: {
    fontSize: 20, // 20px font size
    fontWeight: "700", // Bold weight (700)
    color: "#1f2a44", // Dark blue-gray color
  },

  // Empty placeholder view - balances back button width for centered title
  placeholder: {
    width: 40, // Same width as back button + padding (24 + 16 = 40) to center title
  },

  // Container for the muscle SVG - centers it on screen
  muscleContainer: {
    alignItems: "center", // Centers children horizontally
    justifyContent: "center", // Centers children vertically
    paddingVertical: 20, // 20px padding top and bottom
  },

  // Wrapper around front muscle SVG - provides alignment
  muscleWrapperFront: {
    alignItems: "center", // Centers SVG horizontally
    justifyContent: "center", // Centers SVG vertically
    transform: [{ scaleX: 1.3 }, { scaleY: 1.15 }],
    top: 35,
  },

  // Wrapper around back muscle SVG - provides alignment
  muscleWrapperBack: {
    alignItems: "center", // Centers SVG horizontally
    justifyContent: "center", // Centers SVG vertically
    transform: [{ scaleX: 1.1 }, { scaleY: 1.15 }],
    top: 35,
  },

  // Controls container - holds the flip button
  controls: {
    position: "absolute", // Positioned absolutely, doesn't affect layout flow
    top: 120, // 120px from top of screen
    right: 20, // 20px from right edge
    zIndex: 1000, // High z-index ensures it appears above other elements
  },

  // Flip/rotate button styling
  rotateBtn: {
    backgroundColor: "#C4C4C4", // Light gray background
    borderRadius: 22, // 22px radius = circular button (if width = height)
    padding: 10, // 10px padding inside button (makes it larger)
    elevation: 6, // Android shadow depth (creates 3D effect)
    top: -70, // Negative top - moves it up from controls container position
  },
});

export default MuscleDetailScreen;
