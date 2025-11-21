import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LeaderboardRowProps {
  rank: number;
  username: string;
  score: number;
  change: string;
  onPress?: () => void;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  username,
  score,
  change,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.score}>{score.toLocaleString()} pts</Text>
      </View>
      <View style={styles.changeBadge}>
        <Ionicons name="arrow-up" size={12} color="#1f2a44" />
        <Text style={styles.changeText}>{change}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#f9fafc",
    borderWidth: 1,
    borderColor: "#d9e0f3",
    gap: 14,
    shadowColor: "#1f2a44",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1f2a44",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
  },
  score: {
    fontSize: 12,
    color: "#5a6a7e",
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d9e0f3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2a44",
  },
});

export default LeaderboardRow;

