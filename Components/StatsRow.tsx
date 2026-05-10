import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated, Easing } from "react-native";
import { useUser } from "../Contexts/UserContext";
import {
  accent,
  accentBright,
  borderSubtle,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";

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
  const { lifetimeWeightLifted, currentStreak, streakStatus } = useUser();
  const resolvedLifetimeWeight = Math.floor(
    lifetimeWeightLifted ?? totalWeightLiftedLbs ?? 0,
  );
  const lifetimeWeightLabel =
    resolvedLifetimeWeight > 9999
      ? `${Math.floor(resolvedLifetimeWeight / 1000)}k lbs`
      : `${resolvedLifetimeWeight} lbs`;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const streakVisualMode: "active" | "risk" | "none" | "idle" =
    currentStreak <= 0
      ? "none"
      : streakStatus === "AT_RISK"
        ? "risk"
        : streakStatus === "ACTIVE"
          ? "active"
          : "idle";

  useEffect(() => {
    if (streakVisualMode === "idle") {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
      return;
    }

    const pulse =
      streakVisualMode === "risk"
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 420,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 520,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: false,
              }),
            ]),
          )
        : Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 1300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 1300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
            ]),
          );
    pulse.start();
    return () => pulse.stop();
  }, [streakVisualMode, glowAnim]);

  const streakGlowStyle =
    streakVisualMode === "active"
      ? {
          borderColor: accent,
          shadowColor: accent,
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.85],
          }),
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [6, 16],
          }),
          shadowOffset: { width: 0, height: 0 },
          elevation: 14,
          transform: [
            {
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02],
              }),
            },
          ],
        }
      : streakVisualMode === "risk"
        ? {
            borderColor: accentBright,
            shadowColor: accentBright,
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.95],
            }),
            shadowRadius: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [5, 18],
            }),
            shadowOffset: { width: 0, height: 0 },
            elevation: 16,
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.012],
                }),
              },
            ],
          }
        : streakVisualMode === "none"
          ? {
              borderColor: "rgba(255,255,255,0.35)",
              shadowColor: "#ffffff",
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.08, 0.32],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1.5, 4],
              }),
              shadowOffset: { width: 0, height: 0 },
              elevation: 4,
            }
          : null;

  const streakMeta =
    streakStatus === "AT_RISK"
      ? "at risk"
      : streakStatus === "BROKEN"
        ? "reset"
        : "";


  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Lifetime Weights Lifted</Text>
        <Text style={styles.statValue}>{lifetimeWeightLabel}</Text>
      </View>
      <Animated.View style={[styles.statCard, styles.streakCard, streakGlowStyle]}>
        <Text style={styles.statLabel}>Streak</Text>
        <Text style={styles.statValue}>{currentStreak} day{currentStreak === 1 ? "" : "s"}</Text>
        {streakMeta ? <Text style={styles.streakMeta}>{streakMeta}</Text> : null}
      </Animated.View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  streakCard: {
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: textSecondary,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: textPrimary,
    textAlign: "center",
  },
  streakMeta: {
    marginTop: 2,
    fontSize: 11,
    color: textSecondary,
    textTransform: "uppercase",
  },
});

export default StatsRow;

