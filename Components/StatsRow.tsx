import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useUser } from "../Contexts/UserContext";
import { surfaceMuted, textSecondary } from "../theme/colors";

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
    marginTop: 16,
  },
  statCard: {
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e85d04",
  },
});

export default StatsRow;

