import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

interface MuscleInfo {
  name: string;
  subname: string;
  description: string;
  exercises: string[];
}

interface InfoPanelProps {
  info: MuscleInfo;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ info }) => {
  return (
    <View style={styles.infoPanel}>
      <ScrollView style={styles.infoScroll}>
        <Text style={styles.muscleName}>{info.name}</Text>
        <Text style={styles.muscleSubname}>{info.subname}</Text>
        <Text style={styles.muscleDescription}>{info.description}</Text>
        <Text style={styles.exercisesTitle}>Exercises:</Text>
        {info.exercises.map((exercise, idx) => (
          <Text key={idx} style={styles.exerciseItem}>
            • {exercise}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  infoPanel: {
    position: "absolute",
    bottom: 160,
    left: 20,
    right: 20,
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    padding: 16,
    maxHeight: height * 0.3,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  infoScroll: {
    flex: 1,
  },
  muscleName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 4,
  },
  muscleSubname: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#51607a",
    marginBottom: 8,
  },
  muscleDescription: {
    fontSize: 14,
    color: "#51607a",
    lineHeight: 20,
    marginBottom: 12,
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  exerciseItem: {
    fontSize: 14,
    color: "#51607a",
    marginBottom: 4,
  },
});

export default InfoPanel;

