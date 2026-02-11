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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {routine.name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#51607a" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
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
  chevron: {
    alignSelf: "flex-end",
  },
});

export default RoutineCard;
