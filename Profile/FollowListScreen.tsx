import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import NavBar from "../Components/NavBar";
import { getFollowers, getFollowing } from "../Services/followApi";
import { follow, unfollow, checkFollow } from "../Services/followApi";
import { useUser } from "../Contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";

type FollowListMode = "followers" | "following";

export interface FollowListUser {
  sub_id?: string;
  subId?: string;
  username?: string;
  first_name?: string;
  profile_pic_url?: string;
  profilePicUrl?: string;
  pfp_link?: string;
  [key: string]: unknown;
}

const getPfpUrl = (user: FollowListUser): string | undefined => {
  const raw = user.profile_pic_url ?? user.profilePicUrl ?? user.pfp_link;
  return raw ? (String(raw).startsWith("http") ? raw : `https://${raw}`) : undefined;
};

const FollowListScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId: currentUserId, addToFollowingCount } = useUser();
  const subId = route.params?.subId ?? route.params?.sub_id;
  const mode: FollowListMode = route.params?.mode ?? "followers";
  const displayName = route.params?.displayName ?? "User";

  const [users, setUsers] = useState<FollowListUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!subId) {
      setError("No user specified");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchList = mode === "followers" ? getFollowers : getFollowing;
    fetchList(subId)
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load list");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [subId, mode]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return;
    const ids = users.map((u) => u.sub_id ?? u.subId).filter(Boolean) as string[];
    if (ids.length === 0) return;
    let cancelled = false;
    const checkAll = async () => {
      const followed = new Set<string>();
      await Promise.all(
        ids.map(async (id) => {
          if (id === currentUserId) return;
          try {
            const isFollowing = await checkFollow(currentUserId, id);
            if (isFollowing && !cancelled) followed.add(id);
          } catch {}
        })
      );
      if (!cancelled) setFollowedUserIds(followed);
    };
    checkAll();
    return () => { cancelled = true; };
  }, [currentUserId, users]);

  const handleUserPress = (user: FollowListUser) => {
    const id = user.sub_id ?? user.subId;
    if (id) navigation.navigate("UserProfile", { subId: id });
  };

  const handleFollowPress = async (user: FollowListUser) => {
    const id = user.sub_id ?? user.subId;
    if (!id || !currentUserId) return;
    try {
      addToFollowingCount(1);
      await follow(id);
      setFollowedUserIds((prev) => new Set(prev).add(id));
    } catch {
      addToFollowingCount(-1);
    }
  };

  const handleUnfollowPress = async (user: FollowListUser) => {
    const id = user.sub_id ?? user.subId;
    if (!id) return;
    try {
      addToFollowingCount(-1);
      await unfollow(id);
      setFollowedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      addToFollowingCount(1);
    }
  };

  const renderUser = ({ item, index }: { item: FollowListUser; index: number }) => {
    const userSubId = item.sub_id ?? item.subId;
    const displayNameUser = item.username ?? item.first_name ?? "User";
    const pfpUrl = getPfpUrl(item);
    const isCurrentUser = currentUserId && userSubId === currentUserId;
    const isFollowing = userSubId ? followedUserIds.has(userSubId) : false;

    return (
      <View style={styles.userRow}>
        <TouchableOpacity
          style={styles.userRowContent}
          onPress={() => handleUserPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            {pfpUrl ? (
              <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {displayNameUser.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.username}>{displayNameUser}</Text>
        </TouchableOpacity>
        {!isCurrentUser && userSubId ? (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => (isFollowing ? handleUnfollowPress(item) : handleFollowPress(item))}
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
  };

  const title =
    mode === "followers"
      ? displayName === "Your"
        ? "Your Followers"
        : `${displayName}'s Followers`
      : displayName === "Your"
        ? "Your Following"
        : `${displayName} Following`;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.headerTitle}>{title}</Text>
        <ActivityIndicator size="large" color="#1f2a44" style={styles.loader} />
        <NavBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      {users.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color="#a2a2a2" />
          <Text style={styles.emptyText}>
            {mode === "followers" ? "No followers yet" : "Not following anyone yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, i) => (item.sub_id ?? item.subId ?? `u-${i}`) as string}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#0f1724",
    textAlign: "center",
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#5a6a7e",
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#5a6a7e",
  },
});

export default FollowListScreen;
