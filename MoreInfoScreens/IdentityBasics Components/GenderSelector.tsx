import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import GenderButton from "./GenderButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GenderSelectorProps {
  selectedGender: string | null;
  onSelect: (gender: "Male" | "Female") => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, onSelect }) => {
  return (
    <>
      <Text style={[styles.label, { marginBottom: 25 }]}>
        Select your gender
      </Text>
      <View style={styles.genderWrapper}>
        <GenderButton
          gender="Male"
          isSelected={selectedGender === "Male"}
          onPress={() => onSelect("Male")}
        />
        <GenderButton
          gender="Female"
          isSelected={selectedGender === "Female"}
          onPress={() => onSelect("Female")}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
  },
  genderWrapper: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: SCREEN_WIDTH * 0.9,
  },
});

export default GenderSelector;

