import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PodiumCardProps {
  rank: number;
  name: string;
  score: number;
  isFirst?: boolean;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ rank, name, score, isFirst }) => {
  const getBadgeStyle = () => {
    if (rank === 1) return styles.podiumBadgeFirst;
    if (rank === 2) return styles.podiumBadgeSecond;
    return styles.podiumBadgeThird;
  };

  return (
    <View style={[styles.podiumCard, isFirst && styles.podiumCardFirst]}>
      <View style={[styles.podiumBadge, getBadgeStyle()]}>
        <Text style={styles.podiumRank}>{rank}</Text>
      </View>
      <Text style={[styles.podiumName, isFirst && styles.podiumNamePrimary]}>
        {name}
      </Text>
      <Text style={[styles.podiumScore, isFirst && styles.podiumScorePrimary]}>
        {score.toLocaleString()} pts
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  podiumCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#f4f6fa",
    borderWidth: 1,
    borderColor: "#e0e5ef",
    gap: 8,
  },
  podiumCardFirst: {
    paddingVertical: 24,
    borderColor: "#1f2a44",
    backgroundColor: "#1f2a44",
    transform: [{ translateY: -10 }],
  },
  podiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  podiumBadgeFirst: {
    backgroundColor: "#1f2a44",
  },
  podiumBadgeSecond: {
    backgroundColor: "#2e3d66",
  },
  podiumBadgeThird: {
    backgroundColor: "#41517e",
  },
  podiumRank: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
  },
  podiumScore: {
    fontSize: 12,
    color: "#5a6a7e",
  },
  podiumNamePrimary: {
    color: "#fff",
  },
  podiumScorePrimary: {
    color: "#dfe5ff",
  },
});

export default PodiumCard;

