import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAchievement } from "../Contexts/AchievementContext";

const NAV_BAR_HEIGHT = 70;

/**
 * Achievement toast triggered by MEDAL_EARNED notifications.
 * Xbox 360–style: pill-shaped popup at bottom, above navbar.
 * On touch: navigates to Notifications tab and dismisses.
 */
const AchievementToast = () => {
  const navigation = useNavigation<any>();
  const { activeAchievement, dismissAchievement, triggerAchievementCheck } =
    useAchievement();

  useEffect(() => {
    triggerAchievementCheck();
  }, [triggerAchievementCheck]);

  const handlePress = () => {
    dismissAchievement();
    navigation.navigate("Notifications");
  };

  if (!activeAchievement) return null;

  const displayName =
    activeAchievement.medalName ?? activeAchievement.message ?? "Achievement unlocked!";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.pill}>
        <View style={styles.iconCircle}>
          <Ionicons name="trophy" size={28} color="#ffd700" />
        </View>
        <Text style={styles.achievementName} numberOfLines={1}>
          {displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: NAV_BAR_HEIGHT + 12,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 28,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 20,
    minWidth: 280,
    maxWidth: Dimensions.get("window").width - 24,
    borderWidth: 2,
    borderColor: "#3d3d3d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2d2d2d",
    borderWidth: 2,
    borderColor: "#4a4a4a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  achievementName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

export default AchievementToast;
