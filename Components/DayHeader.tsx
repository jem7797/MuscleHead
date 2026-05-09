import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { textPrimary, textSecondary } from "../theme/colors";

interface DayHeaderProps {
  dayName: string;
  workoutPlanForDay: string;
  onEditPress: () => void;
}

const DayHeader: React.FC<DayHeaderProps> = ({
  dayName,
  workoutPlanForDay,
  onEditPress,
}) => {
  return (
    <>
      <Text style={styles.dayTitle}>{dayName}</Text>
      <TouchableOpacity style={styles.editScheduleContainer} onPress={onEditPress}>
        <Text style={styles.daySubtitle}>{workoutPlanForDay} </Text>
        <Ionicons name="pencil-outline" size={16} color={textSecondary} />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
    color: textPrimary,
  },
  daySubtitle: {
    textAlign: "center",
    color: textSecondary,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  editScheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});

export default DayHeader;

