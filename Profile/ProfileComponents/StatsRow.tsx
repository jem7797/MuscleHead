import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * StatsRow Component
 * Displays user statistics (Following, Posts, Followers)
 */
interface Stat {
  label: string;
  value: string;
}

interface StatsRowProps {
  stats: Stat[];
}

const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.statItem}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f1724",
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#5a6a7e",
  },
});

export default StatsRow;

