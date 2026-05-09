import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../Contexts/UserContext";
import {
  accentBright,
  accentDeep,
  borderSubtle,
  surfaceMuted,
} from "../../theme/colors";
const SEGMENT_COUNT = 5;
const xp_PER_FULL_BAR = 5;

/**
 * ProgressBar Component
 * Displays 5 segments. Filled based on (xp % 5): 0–4 xp fills 0–4 segments; at 5 xp the bar resets (0 filled), then 6 xp = 1 filled, etc.
 */


const ProgressBar = () => {

  const {xp} = useUser();

  const filledCount = Math.min(SEGMENT_COUNT, xp % xp_PER_FULL_BAR);

  return (
    <View style={styles.progressBarContainer}>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={styles.progressBarDivider} />}
          {i < filledCount ? (
            <LinearGradient
              colors={[accentDeep, accentBright]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.progressBarSegment}
            />
          ) : (
            <View style={styles.progressBarSegmentGrey} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 10,
    flexDirection: "row",
    backgroundColor: surfaceMuted,
    borderRadius: 5,
    marginBottom: 14,
    overflow: "hidden",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  progressBarSegmentGrey: {
    flex: 1,
    backgroundColor: borderSubtle,
    height: "100%",
  },
  progressBarSegment: {
    flex: 1,
    height: "100%",
  },
  progressBarDivider: {
    width: 2,
    backgroundColor: surfaceMuted,
    height: "100%",
  },
});

export default ProgressBar;

