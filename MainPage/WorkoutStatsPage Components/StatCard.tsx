import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  accent,
  borderSubtle,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

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
        <Ionicons name={icon as any} size={32} color={accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: textSecondary,
    textAlign: "center",
  },
  statSubLabel: {
    fontSize: 10,
    color: textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
});

export default StatCard;

