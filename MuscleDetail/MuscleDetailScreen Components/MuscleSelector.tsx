import React from "react";
import { View, StyleSheet } from "react-native";
import SelectorButton from "../../Components/SelectorButton";

import { screenBackground } from "../../theme/colors";
interface MuscleInfo {
  name: string;
  subname: string;
  description: string;
  exercises: string[];
}

interface MuscleSelectorProps {
  muscles: Record<string, MuscleInfo>;
  selectedMuscle: string | null;
  onSelect: (muscleId: string) => void;
}

const MuscleSelector: React.FC<MuscleSelectorProps> = ({
  muscles,
  selectedMuscle,
  onSelect,
}) => {
  const muscleOptions = Object.keys(muscles).map(id => muscles[id].name);
  const selectedName = selectedMuscle ? muscles[selectedMuscle]?.name : null;
  const selectedIndex = muscleOptions.indexOf(selectedName || "");
  const selectedKey = selectedIndex >= 0 ? Object.keys(muscles)[selectedIndex] : null;

  const handleSelect = (name: string) => {
    const muscleId = Object.keys(muscles).find(id => muscles[id].name === name);
    if (muscleId) {
      onSelect(muscleId);
    }
  };

  return (
    <View style={styles.muscleSelector}>
      <SelectorButton
        options={muscleOptions}
        selected={selectedName}
        onSelect={handleSelect}
        title="Select Muscle:"
        showTitle={true}
        horizontal={true}
        containerStyle={styles.selectorContainer}
        buttonStyle={styles.muscleButton}
        activeButtonStyle={styles.muscleButtonActive}
        textStyle={styles.muscleButtonText}
        activeTextStyle={styles.muscleButtonTextActive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  muscleSelector: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: screenBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  selectorContainer: {
    marginBottom: 0,
  },
  muscleButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f4f6fa",
    borderColor: "#e0e6f0",
  },
  muscleButtonActive: {
    backgroundColor: "#e85d04",
    borderColor: "#e85d04",
  },
  muscleButtonText: {
    fontSize: 14,
    color: "#51607a",
  },
  muscleButtonTextActive: {
    color: "#fff",
  },
});

export default MuscleSelector;

