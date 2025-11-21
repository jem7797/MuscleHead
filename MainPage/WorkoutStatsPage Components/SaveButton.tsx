import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface SaveButtonProps {
  onPress: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.saveButton} onPress={onPress}>
        <Text style={styles.saveButtonText}>Save & Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default SaveButton;

