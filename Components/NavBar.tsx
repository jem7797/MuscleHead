import React from "react";
import { Platform, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../Services/notificationsApi";
import {
  accent,
  navBarGlow,
  textPrimary,
} from "../theme/colors";

const NavBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { pfpLink, privacySetting } = useUser();
  const [pfpError, setPfpError] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  React.useEffect(() => setPfpError(false), [pfpLink]);
  const showPfp = pfpLink && !pfpError;
  const active = route.name;
  const isCommunityActive = active === "Community" || active === "hiddenFeed";
  const isSearchActive = active === "Search" || active === "hiddenSearch";

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchUnreadCount = async () => {
        try {
          const result = await getNotifications(0, 50);
          if (!isActive) return;
          const unread = result.content.filter((n) => !n.read).length;
          setUnreadCount(unread);
        } catch {
          // Ignore errors; badge will simply be hidden
        }
      };
      fetchUnreadCount();
      return () => {
        isActive = false;
      };
    }, []),
  );


  const handleNotificationClick = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
    } catch {
      // Ignore errors; still navigate
    }
    navigation.navigate("Notifications");
  };


  // Nudge icons a bit lower so the bar sits closer to the device bottom edge.
  const bottomPad = Math.max(4, insets.bottom - 4);
  const blurIntensity = Platform.OS === "ios" ? 45 : 70;

  return (
    <BlurView
      intensity={blurIntensity}
      tint="dark"
      style={[
        styles.container,
        {
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.box}>
        <TouchableOpacity
          onPress={() =>
            privacySetting == "hidden"
              ? navigation.navigate("hiddenFeed")
              : navigation.navigate("Community")
          }
        >
          <View
            style={[
              styles.iconSlot,
              isCommunityActive && styles.highlightCircle,
            ]}
          >
            <FontAwesome6
              name="people-group"
              size={24}
              color={isCommunityActive ? "#fff" : textPrimary}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            privacySetting == "hidden"
              ? navigation.navigate("hiddenSearch")
              : navigation.navigate("Search")
          }
        >
          <View
            style={[styles.iconSlot, isSearchActive && styles.highlightCircle]}
          >
            <Feather
              name="search"
              size={24}
              color={isSearchActive ? "#fff" : textPrimary}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("WorkoutInputMainPage")}
        >
          <View
            style={[
              styles.iconSlot,
              active === "WorkoutInputMainPage" && styles.highlightCircle,
            ]}
          >
            <Ionicons
              name="barbell-sharp"
              size={30}
              color={active === "WorkoutInputMainPage" ? "#fff" : textPrimary}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNotificationClick()}>
          <View
            style={[
              styles.iconSlot,
              active === "Notifications" && styles.highlightCircle,
            ]}
          >
            <Ionicons
              name="notifications"
              size={24}
              color={active === "Notifications" ? "#fff" : textPrimary}
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <View
            style={[
              styles.iconSlot,
              active === "Profile" && styles.highlightCircle,
            ]}
          >
            {showPfp ? (
              <Image
                source={{ uri: pfpLink }}
                style={styles.profileIcon}
                onError={() => setPfpError(true)}
              />
            ) : (
              <Ionicons
                name="person"
                size={24}
                color={active === "Profile" ? "#fff" : textPrimary}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -4,
    left: 0,
    right: 0,
    paddingTop: 17,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.14)",
    overflow: "visible",
  },

  box: {
    alignContent: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
    overflow: "visible",
  },

  iconSlot: {
    minWidth: 49,
    minHeight: 42,
    padding: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  highlightCircle: {
    backgroundColor: accent,
    borderRadius: 36,
    minWidth: 51,
    minHeight: 52,
    padding: 13,
    transform: [{ translateY: -11 }],
    elevation: 12,
    shadowColor: navBarGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default NavBar;
