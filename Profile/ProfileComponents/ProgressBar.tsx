import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * ProgressBar Component
 * Displays a three-segment progress bar showing user progress
 * Currently shows 3 grey segments (can be customized to show completed segments in blue)
 */
const ProgressBar: React.FC = () => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarSegment} />
      <View style={styles.progressBarDivider} />
      <View style={styles.progressBarSegmentGrey} />
      <View style={styles.progressBarDivider} />
      <View style={styles.progressBarSegmentGrey} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 8,
    flexDirection: "row",
    backgroundColor: "#e5e9f3",
    borderRadius: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressBarSegmentGrey: {
    flex: 1,
    backgroundColor: "#b4b4b4",
    height: "100%",
  },
  progressBarSegment: {
    flex: 1,
    backgroundColor: "#202c76",
    height: "100%",
  },
  progressBarDivider: {
    width: 2,
    backgroundColor: "#fff",
    height: "100%",
  },
});

export default ProgressBar;

