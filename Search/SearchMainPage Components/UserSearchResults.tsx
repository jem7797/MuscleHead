import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProfilePicUrl } from "../../utils/profilePicUrl";
import { useUser } from "../../Contexts/UserContext";
import { Image } from "expo-image";

export interface SearchUser {
  sub_id?: string;
  username?: string;
  first_name?: string;
  profile_pic_url?: string;
  profilePicUrl?: string;
  profilePicVersion?: number | null;
  [key: string]: unknown;
}

interface UserSearchResultsProps {
  users: SearchUser[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onUserPress?: (user: SearchUser) => void;
  onFollowPress?: (user: SearchUser) => void;
  onUnfollowPress?: (user: SearchUser) => void;
  followedUserIds?: Set<string>;
  currentUserId?: string | null;
  emptyMessage?: string;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  isLoading,
  hasMore,
  onLoadMore,
  onUserPress,
  onFollowPress,
  onUnfollowPress,
  followedUserIds = new Set(),
  currentUserId,
  emptyMessage = "No users found",
}) => {
  if (isLoading && users.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#1f2a44" />
        </View>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color="#a2a2a2" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Users</Text>
      {users.map((user, index) => {
        const displayName = user.username ?? user.first_name ?? "User";
        const userSubId = user.sub_id ?? (user as { subId?: string }).subId;
        const isCurrentUser = currentUserId && userSubId === currentUserId;
        const pfpUrl = isCurrentUser && pfpLink ? pfpLink : getProfilePicUrl(user);
        const key = user.sub_id ? `${user.sub_id}-${index}` : `user-${index}`;
        const isFollowing = userSubId ? followedUserIds.has(userSubId) : false;

        return (
          <View key={key} style={styles.userRow}>
            <TouchableOpacity
              style={styles.userRowContent}
              onPress={() => onUserPress?.(user)}
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
            </TouchableOpacity>
            {!isCurrentUser ? (
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={() => (isFollowing ? onUnfollowPress?.(user) : onFollowPress?.(user))}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={20} color="#9aa6bd" />
              </View>
            )}
          </View>
        );
      })}
      {hasMore && (
        <TouchableOpacity
          style={styles.loadMore}
          onPress={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1f2a44" />
          ) : (
            <Text style={styles.loadMoreText}>Load more</Text>
          )}
        </TouchableOpacity>
      )}
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
  userRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#1f2a44",
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: "#5a6a7e",
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  chevron: {
    padding: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#708090",
    alignItems: "center",
    justifyContent: "center",
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
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "500",
    color: "#0f1724",
  },
  loadMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2a44",
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#5a6a7e",
  },
});

export default UserSearchResults;
