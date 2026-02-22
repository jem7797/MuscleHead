import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

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
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  touchable: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f1724",
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#5a6a7e",
  },
});

export default StatsRow;

