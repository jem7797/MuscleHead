import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAchievement } from "../Contexts/AchievementContext";

const NAV_BAR_HEIGHT = 70;
const DISPLAY_DURATION_MS = 5000;

type AchievementToastProps = {
  navigationRef: React.RefObject<{ navigate: (name: string) => void; isReady: () => boolean } | null>;
};

/**
 * Achievement toast triggered by MEDAL_EARNED notifications.
 * Xbox 360–style: pill-shaped popup at bottom, above navbar.
 * Multiple achievements show one after another with 5 seconds between each.
 * On touch: navigates to Notifications tab and clears the queue.
 */
const SLIDE_DISTANCE = 100;
const SPRING_CONFIG = { tension: 100, friction: 8 };

const AchievementToast = ({ navigationRef }: AchievementToastProps) => {
  const {
    activeAchievement,
    dismissAchievement,
    triggerAchievementCheck,
  } = useAchievement();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerAchievementCheck();
  }, [triggerAchievementCheck]);

  useEffect(() => {
    if (!activeAchievement) return;
    translateY.setValue(SLIDE_DISTANCE);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        ...SPRING_CONFIG,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    timerRef.current = setTimeout(() => {
      dismissAchievement();
      timerRef.current = null;
    }, DISPLAY_DURATION_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeAchievement, dismissAchievement]);

  const handlePress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dismissAchievement();
    if (navigationRef?.current?.isReady()) {
      navigationRef.current.navigate("Notifications");
    }
  };

  if (!activeAchievement) return null;

  const rawName =
    activeAchievement.medalName ?? activeAchievement.message ?? "Achievement unlocked!";
  const displayName = rawName.replace(/_/g, " ");

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.pill,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="trophy" size={28} color="#ffd700" />
        </View>
        <Text style={styles.achievementName} numberOfLines={1}>
          {displayName}
        </Text>
      </Animated.View>
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
    backgroundColor: "#e85d04",
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
