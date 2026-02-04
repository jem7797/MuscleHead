import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../Contexts/UserContext";

/**
 * ProfileHeader Component
 * Displays the user's profile picture, display name, and rank
 */

const ProfileHeader = () => {
  const { username, rank } = useUser();
  const userName = username ?? "User";
  const rankName = rank?.name ?? " ";

  return (
    <>
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profilePicture}
          accessibilityRole="button"
          accessibilityLabel="Edit profile picture"
        >
          <Ionicons name="person" color="#fff" size={44} />
          <View style={styles.cameraPill}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.displayName}>{userName}</Text>
      </View>

      <View>
        <Text style={styles.rankText}>{rankName}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    marginTop: 0,
    alignItems: "center",
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#e6eef8",
    backgroundColor: "#708090",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cameraPill: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    backgroundColor: "#1f2a44",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "600",
    color: "#0f1724",
  },
  rankText: {
    color: "darkgrey",
  },
});

export default ProfileHeader;

