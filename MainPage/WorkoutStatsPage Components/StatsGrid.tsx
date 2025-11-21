import React from "react";
import { View, StyleSheet } from "react-native";
import StatCard from "./StatCard";

interface StatsGridProps {
  totalTime: string;
  totalWeight: number;
  maxLift: number;
  maxLiftExercise: string;
  totalSets: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  totalTime,
  totalWeight,
  maxLift,
  maxLiftExercise,
  totalSets,
}) => {
  return (
    <View style={styles.statsGrid}>
      <StatCard icon="time-outline" value={totalTime} label="Total Time" />
      <StatCard icon="fitness-outline" value={totalWeight.toLocaleString()} label="Total Weight (lbs)" />
      <StatCard icon="trophy-outline" value={maxLift} label="Max Lift (lbs)" subLabel={maxLiftExercise} />
      <StatCard icon="list-outline" value={totalSets} label="Total Sets" />
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
});

export default StatsGrid;

