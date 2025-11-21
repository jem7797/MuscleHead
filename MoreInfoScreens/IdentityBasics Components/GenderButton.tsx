import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GenderButtonProps {
  gender: "Male" | "Female";
  isSelected: boolean;
  onPress: () => void;
}

const GenderButton: React.FC<GenderButtonProps> = ({ gender, isSelected, onPress }) => {
  const iconName = gender === "Male" ? "male" : "female";
  const selectedStyle = gender === "Male" ? styles.maleSelected : styles.femaleSelected;

  return (
    <TouchableOpacity
      style={[styles.genderButton, isSelected && selectedStyle]}
      onPress={onPress}
    >
      <Ionicons
        name={iconName}
        size={50}
        color={isSelected ? "#fff" : "#999"}
      />
      <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
        {gender}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  genderButton: {
    alignItems: "center",
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: 100,
  },
  maleSelected: {
    backgroundColor: "#013cdeff",
    shadowColor: "#3b6fb8",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  femaleSelected: {
    backgroundColor: "#e75480",
    shadowColor: "#ff8ab7",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  genderText: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default GenderButton;

