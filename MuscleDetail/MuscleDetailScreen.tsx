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
// Context provider that manages which muscles should be highlighted
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";

// Get screen dimensions once - used for responsive sizing
const { height, width } = Dimensions.get("window");

// Dictionary storing muscle information - maps muscle ID to name, description, and exercise list
// Used to display info when user selects a muscle
const MUSCLE_INFO: Record<string, { name: string; description: string; exercises: string[] }> = {
    pecs: {
      name: "Pectorals",
      description: "Engineered for power, the chest’s pectoralis major and minor drive every press, push, and punch — the torque center of the upper body.",
      exercises: ["Bench Press", "Push-ups", "Dumbbell Flyes", "Cable Crossovers"],
    },
    biceps: {
      name: "Biceps",
      description: "Two heads, one purpose — to pull. The biceps flex the elbow and twist the forearm with precision, defining every strong grip and curl.",
      exercises: ["Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Cable Curls"],
    },
    triceps: {
      name: "Triceps",
      description: "The unsung heavy lifters of the arm — three powerful heads forming two-thirds of your arm’s mass, built to drive every press and lockout.",
      exercises: ["Close-Grip Bench Press", "Overhead Extensions", "Tricep Dips", "Pushdowns"],
    },
    delts: {
      name: "Deltoids",
      description: "Three heads, endless range. The delts lift, rotate, and stabilize the arm — the shoulder’s all-terrain system for motion and control.",
      exercises: ["Overhead Press", "Lateral Raises", "Front Raises", "Rear Delt Flyes"],
    },
    lats: {
      name: "Latissimus Dorsi",
      description: "Wide, powerful, unmistakable — the lats pull the arms down and back, sculpting that signature V-taper and anchoring your upper body strength.",
      exercises: ["Pull-ups", "Lat Pulldowns", "Barbell Rows", "T-Bar Rows"],
    },
    quads: {
      name: "Quadriceps",
      description: "Four engines driving the front of the thigh — the quads extend the knee, power sprints, and turn every step into forward force.",
      exercises: ["Squats", "Leg Press", "Lunges", "Leg Extensions"],
    },
    hamstrings: {
      name: "Hamstrings",
      description: "A trio of muscles running the back of the thigh — built for flexing, hinging, and raw acceleration. Where sprint speed and stability are forged.",
      exercises: ["Romanian Deadlifts", "Leg Curls", "Good Mornings", "Stiff-Leg Deadlifts"],
    },
    glutes: {
      name: "Glutes",
      description: "Three gluteal muscles working as one powerhouse — the drivers of hip thrust, rotation, and control. The workhorses of every stride and lift.",
      exercises: ["Hip Thrusts", "Squats", "Romanian Deadlifts", "Glute Bridges"],
    },
    abs: {
      name: "Abdominals",
      description: "Front-line stability — the abs flex the spine, brace the torso, and link upper and lower power. Every lift begins here.",
      exercises: ["Crunches", "Planks", "Leg Raises", "Hanging Knee Raises"],
    },
    obliques: {
      name: "Obliques",
      description: "Twin sets of angled muscles guarding your core — the obliques twist, bend, and resist torque, giving structure to every turn and pivot.",
      exercises: ["Russian Twists", "Side Planks", "Cable Woodchoppers", "Hanging Oblique Raises"],
    },
    traps: {
      name: "Trapezius",
      description: "A three-tiered muscle running from neck to spine — the traps lift, pull, and stabilize with silent dominance, commanding posture and power.",
      exercises: ["Shrugs", "Upright Rows", "Face Pulls", "High Pulls"],
    },
  };
  
  

const MuscleDetailScreen = () => {
  // Navigation hook - allows going back to previous screen
  const navigation = useNavigation();
  
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
    [spinVal]
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
      {/* Header: back button, title, placeholder for spacing */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2a44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Muscle Guide</Text>
        <View style={styles.placeholder} />
      </View>

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
              <MuscleManBack width={size} height={size} worked={workedMuscles} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.muscleWrapperFront}
            >
              <MuscleManFront width={size} height={size} worked={workedMuscles} />
            </TouchableOpacity>
          )}
        </View>
      </WorkedMusclesProvider>

      {/* Flip button - positioned absolutely */}
      <View style={styles.controls}>
        <Animated.View style={[styles.rotateBtn, { transform: [{ rotate: spin }] }]}>
          <TouchableOpacity
            onPress={handleRotate}
            accessibilityRole="button"
            accessibilityLabel="Flip to front/back view"
          >
            <Ionicons name="swap-horizontal" size={26} color="#1f2a44" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Info panel - shows muscle details when selected */}
      {selectedInfo && (
        <View style={styles.infoPanel}>
          <ScrollView style={styles.infoScroll}>
            <Text style={styles.muscleName}>{selectedInfo.name}</Text>
            <Text style={styles.muscleDescription}>{selectedInfo.description}</Text>
            <Text style={styles.exercisesTitle}>Exercises:</Text>
            {selectedInfo.exercises.map((exercise, idx) => (
              <Text key={idx} style={styles.exerciseItem}>
                • {exercise}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Muscle selector - bottom bar with scrollable buttons */}
      <View style={styles.muscleSelector}>
        <Text style={styles.selectorTitle}>Select Muscle:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {Object.keys(MUSCLE_INFO).map((muscleId) => (
            <TouchableOpacity
              key={muscleId}
              style={[
                styles.muscleButton,
                selectedMuscle === muscleId && styles.muscleButtonActive,
              ]}
              onPress={() => handleMuscleClick(muscleId)}
            >
              <Text
                style={[
                  styles.muscleButtonText,
                  selectedMuscle === muscleId && styles.muscleButtonTextActive,
                ]}
              >
                {MUSCLE_INFO[muscleId].name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  
  // ScrollView inside info panel
  infoScroll: {
    flex: 1, // Takes all available space in parent
  },
  
  // Muscle name text (e.g., "Pectorals")
  muscleName: {
    fontSize: 20, // 20px font size
    fontWeight: "700", // Bold
    color: "#1f2a44", // Dark blue-gray
    marginBottom: 8, // 8px space below name
  },
  
  // Description paragraph text
  muscleDescription: {
    fontSize: 14, // 14px font size
    color: "#51607a", // Medium gray color (lighter than title)
    lineHeight: 20, // 20px between lines (readability)
    marginBottom: 12, // 12px space below description
  },
  
  // "Exercises:" label text
  exercisesTitle: {
    fontSize: 16, // 16px font size
    fontWeight: "600", // Semi-bold
    color: "#1f2a44", // Dark blue-gray
    marginBottom: 8, // 8px space below label
  },
  
  // Individual exercise item text (bullet point)
  exerciseItem: {
    fontSize: 14, // 14px font size
    color: "#51607a", // Medium gray
    marginBottom: 4, // 4px space between exercises
  },
  
  // Info panel - appears above muscle selector when muscle is selected
  infoPanel: {
    position: "absolute", // Absolutely positioned, floats above content
    bottom: 160, // 160px from bottom (above muscle selector)
    left: 20, // 20px from left edge
    right: 20, // 20px from right edge (creates margins)
    backgroundColor: "#f4f6fa", // Light gray-blue background
    borderRadius: 12, // 12px rounded corners
    padding: 16, // 16px padding inside panel
    maxHeight: height * 0.3, // Maximum 30% of screen height (prevents overflow)
    elevation: 8, // Android shadow depth (makes it appear raised)
    // iOS shadow properties (elevation is Android-only)
    shadowColor: "#000", // Black shadow
    shadowOpacity: 0.15, // 15% opacity (semi-transparent)
    shadowRadius: 8, // 8px blur radius
    shadowOffset: { width: 0, height: 3 }, // 3px offset downward
  },
  
  // Muscle selector bar - fixed at bottom of screen
  muscleSelector: {
    position: "absolute", // Absolutely positioned
    bottom: 50, // 50px from bottom (raised for better visibility)
    left: 0, // Starts at left edge
    right: 0, // Extends to right edge (full width)
    backgroundColor: "#fff", // White background
    paddingVertical: 12, // 12px padding top and bottom
    paddingHorizontal: 16, // 16px padding left and right
    elevation: 8, // Android shadow depth
    // iOS shadow (subtle, upward shadow since it's at bottom)
    shadowColor: "#000", // Black shadow
    shadowOpacity: 0.1, // 10% opacity (lighter than info panel)
    shadowRadius: 4, // 4px blur
    shadowOffset: { width: 0, height: -2 }, // -2px offset upward (negative)
  },
  
  // "Select Muscle:" label text
  selectorTitle: {
    fontSize: 15, // 15px font size
    fontWeight: "700", // Semi-bold
    color: "#1f2a44", // Dark blue-gray
    marginBottom: 10, // 10px space below label
  },
  
  // Horizontal ScrollView container
  selectorScroll: {
    flexDirection: "row", // Arranges children horizontally (buttons in a row)
  },
  
  // Individual muscle button (inactive state)
  muscleButton: {
    paddingVertical: 13, // 13px padding top and bottom
    paddingHorizontal: 16, // 16px padding left and right
    borderRadius: 20, // 20px radius = pill-shaped button
    backgroundColor: "#f4f6fa", // Light gray-blue background
    marginRight: 8, // 8px space to right (gap between buttons)
    borderWidth: 1, // 1px border
    borderColor: "#e0e6f0", // Light gray border
    bottom: 0, // Moves button down 20px (adjustment for layout)
  },
  
  // Active muscle button (when selected)
  muscleButtonActive: {
    backgroundColor: "#202c76", // Blue background (primary color)
    borderColor: "#202c76", // Blue border (matches background)
  },
  
  // Button text (inactive state)
  muscleButtonText: {
    fontSize: 14, // 13px font size
    fontWeight: "500", // Medium weight
    color: "#51607a", // Medium gray text
  },
  
  // Active button text (when selected)
  muscleButtonTextActive: {
    color: "#fff", // White text (for contrast on blue background)
  },
});

export default MuscleDetailScreen;
