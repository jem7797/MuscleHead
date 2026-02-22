import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SearchUser } from "./UserSearchResults";

const getPfpUrl = (user: SearchUser): string | undefined => {
  const raw = user.profile_pic_url ?? user.profilePicUrl ?? (user as { pfp_link?: string }).pfp_link;
  return raw ? (String(raw).startsWith("http") ? raw : `https://${raw}`) : undefined;
};

interface RecentSearchesProps {
  users: SearchUser[];
  onUserPress: (user: SearchUser) => void;
  onClearPress: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ users, onUserPress, onClearPress }) => {
  if (users.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      {users.map((user, index) => {
        const displayName = user.username ?? user.first_name ?? "User";
        const pfpUrl = getPfpUrl(user);
        const subId = user.sub_id ?? (user as { subId?: string }).subId;
        const key = subId ? `${subId}-${index}` : `recent-${index}`;

        return (
          <TouchableOpacity
            key={key}
            style={styles.userRow}
            onPress={() => onUserPress(user)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              {pfpUrl ? (
                <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={styles.username}>{displayName}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9aa6bd" />
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.clearButton} onPress={onClearPress} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={18} color="#9aa6bd" />
        <Text style={styles.clearButtonText}>Clear search history</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f1724",
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#708090",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#0f1724",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#9aa6bd",
    fontWeight: "500",
  },
});

export default RecentSearches;
