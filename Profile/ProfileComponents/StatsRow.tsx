import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  borderSubtle,
  surfaceElevated,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

/**
 * StatsRow Component
 * Displays user statistics (Following, Posts, Followers)
 * Following and Followers are touchable when onFollowingPress/onFollowersPress are provided
 */
interface Stat {
  label: string;
  value: string;
}

interface StatsRowProps {
  stats: Stat[];
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
}

const StatsRow: React.FC<StatsRowProps> = ({
  stats,
  onFollowingPress,
  onFollowersPress,
}) => {
  const getPressHandler = (label: string) => {
    if (label === "Following" && onFollowingPress) return onFollowingPress;
    if (label === "Followers" && onFollowersPress) return onFollowersPress;
    return undefined;
  };

  return (
    <View style={styles.statsCard}>
      <View style={styles.statsRow}>
      {stats.map((stat) => {
        const onPress = getPressHandler(stat.label);
        const content = (
          <>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </>
        );
        return (
          <View key={stat.label} style={styles.statItem}>
            {onPress ? (
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.6}
                style={styles.touchable}
              >
                {content}
              </TouchableOpacity>
            ) : (
              content
            )}
          </View>
        );
      })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  touchable: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 19,
    fontWeight: "800",
    color: textPrimary,
    letterSpacing: 0.2,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: textSecondary,
    letterSpacing: 0.2,
  },
});

export default StatsRow;

