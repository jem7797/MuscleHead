import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

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
            <FontAwesome5 name={metric.icon} size={16} color="#1f2a44" />
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  metricText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: "#1f2a44",
  },
});

export default MetricsRow;

