import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useUser } from "../Contexts/UserContext";

interface StatsRowProps {
  totalWeightLiftedLbs: number;
  totalHours: number;
  totalMinutes: number;
}

const StatsRow: React.FC<StatsRowProps> = ({
  totalWeightLiftedLbs,
  totalHours,
  totalMinutes,
}) => {

  const {lifetimeGymTime, lifetimeWeightLifted} = useUser();


  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Lifetime Weights Lifted</Text>
        <Text style={styles.statValue}>{lifetimeWeightLifted ? lifetimeWeightLifted : totalWeightLiftedLbs} lbs</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Lifetime Workout Time</Text>
        <Text style={styles.statValue}>{`${totalHours}h ${totalMinutes}m`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 130,
  },
  statCard: {
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#51607a",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
});

export default StatsRow;

