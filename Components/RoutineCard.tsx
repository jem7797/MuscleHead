import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface RoutineTemplate {
  id?: number;
  name: string;
  exercises?: { exerciseId: number; orderIndex: number; targetReps: number; targetSets: number }[];
}

interface RoutineCardProps {
  routine: RoutineTemplate;
  onPress: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onPress }) => {
  const exerciseCount = routine.exercises?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {routine.name}
        </Text>
        <Text style={styles.subtitle}>
          {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#51607a" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#51607a",
  },
});

export default RoutineCard;
