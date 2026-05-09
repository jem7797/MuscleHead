import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { surfaceMuted, textSecondary } from "../theme/colors";

export interface RoutineTemplate {
  id?: number;
  name: string;
  exercises?: { exerciseId: number; orderIndex: number; reps: number; sets: number }[];
}

interface RoutineCardProps {
  routine: RoutineTemplate;
  onPress: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onPress }) => {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {routine.name}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: surfaceMuted,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e85d04",
    paddingRight: 5,
  },
  subtitle: {
    fontSize: 13,
    color: textSecondary,
  },
});

export default RoutineCard;
