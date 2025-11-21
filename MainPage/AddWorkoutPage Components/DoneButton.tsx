import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface DoneButtonProps {
  onPress: () => void;
}

const DoneButton: React.FC<DoneButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.doneButtonContainer}>
      <TouchableOpacity onPress={onPress} style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default DoneButton;

