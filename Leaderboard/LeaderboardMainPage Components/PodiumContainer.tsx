import React from "react";
import { View, StyleSheet } from "react-native";
import PodiumCard from "./PodiumCard";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface PodiumContainerProps {
  topThree: LeaderboardEntry[];
}

const PodiumContainer: React.FC<PodiumContainerProps> = ({ topThree }) => {
  // Sort to ensure correct order: 2nd, 1st, 3rd
  const sorted = [...topThree].sort((a, b) => {
    if (a.rank === 1) return 1;
    if (b.rank === 1) return -1;
    return a.rank - b.rank;
  });

  return (
    <View style={styles.podiumContainer}>
      {sorted.map((entry) => (
        <PodiumCard
          key={entry.rank}
          rank={entry.rank}
          name={entry.username}
          score={entry.score}
          isFirst={entry.rank === 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
    gap: 12,
  },
});

export default PodiumContainer;

