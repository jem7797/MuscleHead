import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  borderSubtle,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";

export interface WorkoutSession {
  id?: number;
  name: string;
  subtitle?: string;
  /** ISO date string for sorting/graphing */
  date?: string;
}

interface WorkoutCardProps {
  workout: WorkoutSession;
  onPress: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {workout.name}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={textSecondary} />
      </View>
      {workout.subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {workout.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: textPrimary,
    paddingRight: 5,
  },
  subtitle: {
    fontSize: 13,
    color: textSecondary,
    marginTop: 4,
  },
});

export default WorkoutCard;
