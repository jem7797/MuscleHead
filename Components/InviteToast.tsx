import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useInvite } from "../Contexts/InviteContext";
import { getSessionInviteId, markInviteToastSeen } from "../lib/sessionService";

const NAV_BAR_HEIGHT = 70;
const DISPLAY_DURATION_MS = 5000;

type InviteToastProps = {
  navigationRef: React.RefObject<{
    navigate: (name: string, params?: object) => void;
    isReady?: () => boolean;
  } | null>;
};

/**
 * Session invite toast - pill-shaped popup like achievements.
 * On touch: navigates to Notifications tab where user can Accept/Decline.
 */
const SLIDE_DISTANCE = 100;
const SPRING_CONFIG = { tension: 100, friction: 8 };

const InviteToast = ({ navigationRef }: InviteToastProps) => {
  const { activeInvite, dismissInvite } = useInvite();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!activeInvite) return;
    const inviteId = getSessionInviteId(activeInvite);
    if (inviteId) {
      // Best-effort mark so old pending invites do not replay on restart.
      markInviteToastSeen({ inviteId }).catch(() => {});
    }
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
      dismissInvite();
      timerRef.current = null;
    }, DISPLAY_DURATION_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeInvite, dismissInvite]);

  const handlePress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dismissInvite();
    if (navigationRef?.current?.isReady?.()) {
      navigationRef.current.navigate("Notifications");
    } else if (navigationRef?.current?.navigate) {
      navigationRef.current.navigate("Notifications");
    }
  };

  if (!activeInvite) return null;

  const message = activeInvite.message
    ? activeInvite.message
    : "You've been invited to join a live workout!";

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
          <Image
            source={require("../assets/MultiplayerInviteLogoNoBackground.png")}
            style={styles.inviteLogo}
            contentFit="contain"
          />
        </View>
        <Text style={styles.inviteText} numberOfLines={2}>
          {message}
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
    overflow: "hidden",
  },
  inviteLogo: {
    width: 36,
    height: 36,
  },
  inviteText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

export default InviteToast;
