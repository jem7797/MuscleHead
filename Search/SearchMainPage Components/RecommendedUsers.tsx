import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import type { SearchUser } from "./UserSearchResults";
import { getProfilePicUrl } from "../../utils/profilePicUrl";
import type { RecommendedUserDto } from "../../Services/userApi";

function formatFollowerCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 followers";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M followers`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k followers`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k followers`;
  if (n === 1) return "1 follower";
  return `${n} followers`;
}

export function recommendedDtoToSearchUser(dto: RecommendedUserDto): SearchUser {
  return {
    sub_id: dto.id,
    username: dto.username,
    first_name: dto.display_name,
    profile_pic_url: dto.profile_picture,
    profilePicUrl: dto.profile_picture,
  };
}

interface RecommendedUsersProps {
  users: RecommendedUserDto[];
  isLoading: boolean;
  currentUserId?: string | null;
  followedUserIds: Set<string>;
  requestPendingUserIds: Set<string>;
  followLoadingSubId: string | null;
  onUserPress: (user: SearchUser) => void;
  onFollowPress: (user: SearchUser) => void;
  onUnfollowPress: (user: SearchUser) => void;
}

const RecommendedUsers: React.FC<RecommendedUsersProps> = ({
  users,
  isLoading,
  currentUserId,
  followedUserIds,
  requestPendingUserIds,
  followLoadingSubId,
  onUserPress,
  onFollowPress,
  onUnfollowPress,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recommended Users</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#1f2a44" />
        </View>
      </View>
    );
  }

  if (users.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended Users</Text>
      {users.map((dto, index) => {
        const searchUser = recommendedDtoToSearchUser(dto);
        const subId = dto.id;
        const isCurrentUser = currentUserId && subId === currentUserId;
        const pfpUrl = getProfilePicUrl(searchUser);
        const displayName = dto.display_name?.trim() || dto.username || "User";
        const handle = dto.username ? `@${dto.username}` : "@user";
        const isFollowing = followedUserIds.has(subId);
        const requestPending = requestPendingUserIds.has(subId);
        const followButtonLoading = followLoadingSubId === subId;
        const key = `${subId}-${index}`;

        return (
          <View key={key} style={styles.userRow}>
            <TouchableOpacity
              style={styles.userRowContent}
              onPress={() => onUserPress(searchUser)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                {pfpUrl ? (
                  <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.displayName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.handle} numberOfLines={1}>
                  {handle}
                </Text>
                <Text style={styles.followers}>{formatFollowerCount(dto.number_of_followers)}</Text>
              </View>
            </TouchableOpacity>
            {!isCurrentUser ? (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                  requestPending && styles.requestedButton,
                ]}
                onPress={() =>
                  isFollowing
                    ? onUnfollowPress(searchUser)
                    : requestPending || followButtonLoading
                      ? undefined
                      : onFollowPress(searchUser)
                }
                disabled={requestPending || followButtonLoading}
              >
                <Text style={styles.followButtonText}>
                  {followButtonLoading ? "..." : requestPending ? "Requested" : isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selfSpacer} />
            )}
          </View>
        );
      })}
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
  loadingRow: {
    paddingVertical: 20,
    alignItems: "center",
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
    minWidth: 0,
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
  textBlock: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f1724",
  },
  handle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5a6a7e",
    marginTop: 2,
  },
  followers: {
    fontSize: 13,
    color: "#9aa6bd",
    marginTop: 4,
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#1f2a44",
    borderRadius: 8,
    marginLeft: 8,
  },
  followingButton: {
    backgroundColor: "#5a6a7e",
  },
  requestedButton: {
    backgroundColor: "#9aa6bd",
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  selfSpacer: {
    width: 72,
    marginLeft: 8,
  },
});

export default RecommendedUsers;
