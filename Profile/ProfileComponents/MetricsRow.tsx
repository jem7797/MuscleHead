import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  borderSubtle,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

/**
 * MetricsRow Component
 * Displays user metrics (Height, Weight, Natty status) in circular bubbles
 */
interface Metric {
  icon: string;
  value: string;
}

interface MetricsRowProps {
  metrics: Metric[];
}

const MetricsRow: React.FC<MetricsRowProps> = ({ metrics }) => {
  return (
    <View style={styles.metricsRow}>
      {metrics.map((metric) => (
        <View key={metric.icon} style={styles.metricItem}>
          <View style={styles.metricBubble}>
            <FontAwesome5 name={metric.icon} size={18} color={textPrimary} />
          </View>
          <Text style={styles.metricText}>{metric.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 5,
      },
      android: { elevation: 4 },
    }),
  },
  metricText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: textSecondary,
    textAlign: "center",
  },
});

export default MetricsRow;

