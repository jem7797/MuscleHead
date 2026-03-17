import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import { getNotifications } from "../Services/notificationsApi";
const NavBar = () => {
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
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <TouchableOpacity
          onPress={() =>
            privacySetting == "hidden"
              ? navigation.navigate("hiddenFeed")
              : navigation.navigate("Community")
          }
        >
          <View style={isCommunityActive ? styles.highlightCircle : undefined}>
            <FontAwesome6
              name="people-group"
              size={24}
              color={isCommunityActive ? "#fff" : "black"}
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
          <View style={isSearchActive ? styles.highlightCircle : undefined}>
            <Feather
              name="search"
              size={24}
              color={isSearchActive ? "#fff" : "black"}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("WorkoutInputMainPage")}
        >
          <View
            style={
              active === "WorkoutInputMainPage"
                ? styles.highlightCircle
                : undefined
            }
          >
            <Ionicons
              name="barbell-sharp"
              size={30}
              color={active === "WorkoutInputMainPage" ? "#fff" : "black"}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <View
            style={
              active === "Notifications" ? styles.highlightCircle : undefined
            }
          >
            <Ionicons
              name="notifications"
              size={24}
              color={active === "Notifications" ? "#fff" : "black"}
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
            style={active === "Profile" ? styles.highlightCircle : undefined}
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
                color={active === "Profile" ? "#fff" : "black"}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: "#a2a2a282",
    backgroundColor: "#fff",
  },

  box: {
    alignContent: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    paddingTop: 3,
  },

  highlightCircle: {
    backgroundColor: "#202c76",
    borderRadius: 40,
    padding: 15,
    bottom: 25,
    elevation: 10,
    shadowColor: "#202c76",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
