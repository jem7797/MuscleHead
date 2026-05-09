import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../Contexts/UserContext";
import {
  accent,
  accentBright,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

/**
 * ProfileHeader Component
 * Displays the user's profile picture, display name, and rank
 */

const ProfileHeader = () => {
  const navigation = useNavigation<any>();
  const { username, rank, pfpLink } = useUser();
  const [imgError, setImgError] = useState(false);
  React.useEffect(() => setImgError(false), [pfpLink]);
  const showPfp = pfpLink && !imgError;
  const userName = username ?? "User";
  const rankName = rank?.name ?? " ";

  return (
    <>
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[accent, accentBright]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <TouchableOpacity
            style={styles.profilePicture}
            onPress={() => navigation.navigate("ProfileEdit")}
            accessibilityRole="button"
            accessibilityLabel="Edit profile picture"
          >
            {showPfp ? (
              <Image
                source={{ uri: pfpLink }}
                style={styles.profileImage}
                onError={() => setImgError(true)}
              />
            ) : (
              <>
                <Ionicons name="person" color="#fff" size={44} />
                <View style={styles.cameraPill}>
                  <Ionicons name="add" size={16} color="#fff" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
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
  avatarRing: {
    borderRadius: 40,
    padding: 3,
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraPill: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    backgroundColor: accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: textPrimary,
  },
  rankText: {
    color: textSecondary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
});

export default ProfileHeader;

