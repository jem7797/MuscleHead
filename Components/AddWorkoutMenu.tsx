import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { borderSubtle, surfaceElevated, textPrimary } from "../theme/colors";
const AddWorkoutMenu: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <View style={styles.addWorkoutButton}>
      <TouchableOpacity onPress={() => setShowAddMenu((s) => !s)}>
        <Ionicons name="add" color="#fff" size={20} />
      </TouchableOpacity>
      {showAddMenu && (
        <View style={styles.addMenuContainer}>
          <TouchableOpacity
            style={styles.addMenuItem}
            onPress={() => {
              setShowAddMenu(false);
              navigation.navigate("ConfirmWorkout");
            }}
          >
            <Text style={styles.addMenuText}>Add Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addMenuItem}
            onPress={() => {
              setShowAddMenu(false);
              navigation.navigate("AddWorkoutTemplate");
            }}
          >
            <Text style={styles.addMenuText}>Add Workout Template</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addWorkoutButton: {
    position: "absolute",
    top: 50,
    left: 20,
    borderRadius: 24,
    color: "black",
    backgroundColor: "#e85d04",
    padding: 13,
    zIndex: 400,
    elevation: 8,
  },
  addMenuContainer: {
    position: "absolute",
    left: 56,
    top: -4,
    backgroundColor: surfaceElevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    elevation: 8,
    zIndex: 201,
    minWidth: 180,
    borderWidth: 1,
    borderColor: borderSubtle,
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
    color: textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default AddWorkoutMenu;
