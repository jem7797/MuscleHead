import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  subLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, subLabel }) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={32} color="#e85d04" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e85d04",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  statSubLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    textAlign: "center",
  },
});

export default StatCard;

