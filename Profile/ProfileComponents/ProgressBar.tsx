import React from "react";
import { View, StyleSheet } from "react-native";

const SEGMENT_COUNT = 5;
const XP_PER_FULL_BAR = 5;

/**
 * ProgressBar Component
 * Displays 5 segments. Filled based on (XP % 5): 0–4 XP fills 0–4 segments; at 5 XP the bar resets (0 filled), then 6 XP = 1 filled, etc.
 */
interface ProgressBarProps {
  xp: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ xp }) => {
  const filledCount = Math.min(SEGMENT_COUNT, xp % XP_PER_FULL_BAR);

  return (
    <View style={styles.progressBarContainer}>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={styles.progressBarDivider} />}
          <View
            style={
              i < filledCount ? styles.progressBarSegment : styles.progressBarSegmentGrey
            }
          />
        </React.Fragment>
      ))}
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
    alignItems: "stretch",
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

