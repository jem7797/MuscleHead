import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Dumbbell,
  Trophy,
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  type LucideProps,
} from "lucide-react-native";
import NavBar from "../Components/NavBar";
import { useUser } from "../Contexts/UserContext";
import { useInvite } from "../Contexts/InviteContext";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "../Services/notificationsApi";
import { createAchievementPost } from "../Services/postsApi";
import { getPendingInvites } from "../Services/liveSessionApi";
import type { SessionInvite } from "../Services/liveSessionApi";
import { acceptInvite, declineInvite } from "../lib/sessionService";
import {
  getFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
  type FollowRequestResponse,
} from "../Services/followApi";
import { getProfilePicUrl, type UserWithProfilePic } from "../utils/profilePicUrl";
import { Image } from "expo-image";

const formatTimeAgo = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getIconForType = (type: string): string => {
  const t = (type ?? "").toUpperCase();
  switch (t) {
    case "SESSION_INVITE":
      return "fitness";
    case "MEDAL_EARNED":
    case "LEVEL_UP":
      return "trophy";
    case "NEMESIS_POST":
    case "WORKOUT":
      return "fitness";
    case "FOLLOW":
      return "person-add";
    case "LIKE":
      return "heart";
    case "COMMENT":
      return "chatbubble";
    default:
      return "notifications";
  }
};

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  fitness: Dumbbell,
  trophy: Trophy,
  heart: Heart,
  chatbubble: MessageCircle,
  "person-add": UserPlus,
  notifications: Bell,
};

const isAchievement = (n: Notification) =>
  (n.type ?? "").toUpperCase() === "MEDAL_EARNED";

const PAGE_SIZE = 20;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getActorSubId = (n: Notification): string | null => {
  const id = n.actorSubId ?? n.actor_sub_id ?? n.fromUserId ?? n.from_user_id;
  if (id == null) return null;
  return typeof id === "string" ? id : String(id);
};

type FeedItem =
  | { kind: "notification"; data: Notification }
  | { kind: "invite"; data: SessionInvite }
  | { kind: "followRequest"; data: FollowRequestResponse };

const NotificationCenterScreen = () => {
  const navigation = useNavigation<any>();
  const { userId } = useUser();
  const { removeInvite } = useInvite();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingInvites, setPendingInvites] = useState<SessionInvite[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [postingMedalId, setPostingMedalId] = useState<number | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [followRequests, setFollowRequests] = useState<FollowRequestResponse[]>([]);
  const [followRequestActionId, setFollowRequestActionId] = useState<string | null>(null);

  const handleShareAchievement = async (n: Notification) => {
    const achievementId = n.medalId;
    if (achievementId == null || postingMedalId != null) return;
    setPostingMedalId(n.id);
    try {
      await createAchievementPost(achievementId);
      Alert.alert("Shared!", "Your achievement has been posted to the feed.");
    } catch (e) {
      Alert.alert("Could not share", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setPostingMedalId(null);
    }
  };

  const fetchNotifications = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    const result = await getNotifications(pageNum, PAGE_SIZE);
    const content = Array.isArray(result.content) ? result.content : [];
    setNotifications((prev) => (append ? [...prev, ...content] : content));
    setTotalElements(result.totalElements);
    setPage(pageNum);
    return result;
  }, []);

  const fetchPendingInvites = useCallback(async () => {
    try {
      const invites = await getPendingInvites();
      setPendingInvites(invites.filter((i) => i.status === "pending"));
    } catch {
      setPendingInvites([]);
    }
  }, []);

  const fetchFollowRequests = useCallback(async () => {
    try {
      const requests = await getFollowRequests();
      setFollowRequests(requests ?? []);
    } catch {
      setFollowRequests([]);
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchNotifications(0, false),
      fetchPendingInvites(),
      fetchFollowRequests(),
    ]);
    setLoading(false);
  }, [fetchNotifications, fetchPendingInvites, fetchFollowRequests]);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNotifications(0, false),
      fetchPendingInvites(),
      fetchFollowRequests(),
    ]);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    const hasMore = notifications.length < totalElements;
    if (loadingMore || !hasMore || totalElements === 0) return;
    setLoadingMore(true);
    await fetchNotifications(page + 1, true);
    setLoadingMore(false);
  };

  const handleAcceptInvite = async (invite: SessionInvite) => {
    if (inviteActionId) return;
    setInviteActionId(invite.id);
    try {
      await acceptInvite({ inviteId: invite.id });
      removeInvite(invite.id);
      setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
      if (userId) {
        navigation.navigate("LiveSession", {
          sessionId: invite.session_id,
          currentUserId: userId,
          hostUserId: invite.from_user_id,
          guestUserId: userId,
        });
      }
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not join the session.",
      );
    } finally {
      setInviteActionId(null);
    }
  };

  const handleDeclineInvite = async (invite: SessionInvite) => {
    if (inviteActionId) return;
    setInviteActionId(invite.id);
    try {
      await declineInvite({ inviteId: invite.id });
      removeInvite(invite.id);
      setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (e) {
      console.error("Failed to decline invite:", e);
    } finally {
      setInviteActionId(null);
    }
  };

  const handleAcceptFollowRequest = async (req: FollowRequestResponse) => {
    if (followRequestActionId) return;
    setFollowRequestActionId(req.id);
    try {
      await acceptFollowRequest(req.id);
      setFollowRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not accept request.");
    } finally {
      setFollowRequestActionId(null);
    }
  };

  const handleDeclineFollowRequest = async (req: FollowRequestResponse) => {
    if (followRequestActionId) return;
    setFollowRequestActionId(req.id);
    try {
      await declineFollowRequest(req.id);
      setFollowRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (e) {
      console.error("Failed to decline follow request:", e);
    } finally {
      setFollowRequestActionId(null);
    }
  };

  const feedItems: FeedItem[] = [
    ...pendingInvites.map((inv) => ({ kind: "invite" as const, data: inv })),
    ...followRequests.map((req) => ({ kind: "followRequest" as const, data: req })),
    ...notifications.map((n) => ({ kind: "notification" as const, data: n })),
  ];

  const handleNotificationPress = async (n: Notification) => {
    const type = (n.type ?? "").toUpperCase();
    if (type === "FOLLOW") {
      const actorSubId = getActorSubId(n);
      if (actorSubId) {
        navigation.navigate("UserProfile", { subId: actorSubId });
      }
    }
    if (isAchievement(n)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(n.id)) next.delete(n.id);
        else next.add(n.id);
        return next;
      });
    }
    if (!n.read) {
      try {
        await markNotificationAsRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
      } catch {}
    }
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.kind === "invite") {
      const invite = item.data;
      const message = invite.message ?? "You've been invited to join a live workout!";
      const timeAgo = formatTimeAgo(invite.sent_at);
      const isProcessing = inviteActionId === invite.id;
      const InviteIcon = iconMap["fitness"] ?? Bell;

      return (
        <View style={styles.notificationCard}>
          <View style={styles.notificationRow}>
            <View style={[styles.iconWrapper, styles.inviteIconWrapper]}>
              <InviteIcon size={24} color="#3b6fb8" />
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
          </View>
          <View style={styles.inviteActions}>
            <TouchableOpacity
              style={[styles.declineButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleDeclineInvite(invite)}
              disabled={isProcessing}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleAcceptInvite(invite)}
              disabled={isProcessing}
            >
              <Text style={styles.acceptButtonText}>
                {inviteActionId === invite.id ? "Joining..." : "Accept"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.kind === "followRequest") {
      const req = item.data;
      const requester = req.requester ?? {};
      const subId = requester.sub_id ?? requester.subId;
      const displayName = requester.username ?? requester.first_name ?? "Someone";
      const pfpUrl = getProfilePicUrl(requester as UserWithProfilePic);
      const timeAgo = formatTimeAgo(req.createdAt);
      const isProcessing = followRequestActionId === req.id;

      return (
        <View style={styles.notificationCard}>
          <TouchableOpacity
            style={styles.notificationRow}
            onPress={() => subId && navigation.navigate("UserProfile", { subId })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, styles.followRequestIconWrapper]}>
              {pfpUrl ? (
                <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>{displayName} requested to follow you</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9aa6bd" />
          </TouchableOpacity>
          <View style={styles.inviteActions}>
            <TouchableOpacity
              style={[styles.declineButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleDeclineFollowRequest(req)}
              disabled={isProcessing}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptButton, isProcessing && styles.buttonDisabled]}
              onPress={() => handleAcceptFollowRequest(req)}
              disabled={isProcessing}
            >
              <Text style={styles.acceptButtonText}>
                {isProcessing ? "..." : "Accept"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const n = item.data;
    const timeAgo = formatTimeAgo(n.createdAt);
    const icon = getIconForType(n.type);
    const IconComponent = iconMap[icon] ?? Bell;
    const achievement = isAchievement(n);
    const expanded = expandedIds.has(n.id);
    const rawDisplayName = achievement
      ? (n.medalName ?? n.message ?? "Achievement unlocked!")
      : n.message;
    const displayName = achievement ? rawDisplayName.replace(/_/g, " ") : rawDisplayName;
    const rawDescription = achievement
      ? (n.medalDescription ?? n.message)
      : null;
    const description = rawDescription ? rawDescription.replace(/_/g, " ") : rawDescription;

    return (
      <View style={[styles.notificationCard, n.read && styles.notificationRead]}>
        <TouchableOpacity
          style={styles.notificationRow}
          onPress={() => handleNotificationPress(n)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              achievement && styles.achievementIconWrapper,
            ]}
          >
            <IconComponent
              size={24}
              color={achievement ? "#ffd700" : "#202c76"}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.message}>{displayName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          {achievement ? (
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-forward"}
              size={20}
              color="#9aa6bd"
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#9aa6bd" />
          )}
        </TouchableOpacity>
        {achievement && expanded && description ? (
          <View style={styles.expandedDescription}>
            <Text style={styles.descriptionText}>{description}</Text>
            {n.medalId != null && (
              <TouchableOpacity
                style={[styles.shareButton, postingMedalId === n.id && styles.shareButtonDisabled]}
                onPress={() => handleShareAchievement(n)}
                disabled={postingMedalId != null}
              >
                <Ionicons name="share-social-outline" size={16} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {postingMedalId === n.id ? "Posting..." : "Share to Feed"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  if (loading && feedItems.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <ActivityIndicator size="large" color="#202c76" style={styles.loader} />
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      {feedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color="#a2a2a2" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            When someone follows you, requests to follow you, invites you to a workout, or interacts with your content, you'll see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item) =>
            item.kind === "invite"
              ? `invite-${item.data.id}`
              : item.kind === "followRequest"
                ? `followReq-${item.data.id}`
                : String(item.data.id)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#202c76" />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#202c76"
            />
          }
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
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2a44",
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8ecf4",
    overflow: "hidden",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  achievementIconWrapper: {
    backgroundColor: "rgba(21, 18, 0, 0.81)",
  },
  inviteIconWrapper: {
    backgroundColor: "rgba(59, 111, 184, 0.2)",
  },
  followRequestIconWrapper: {
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
  inviteActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e8ecf4",
    alignItems: "center",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#202c76",
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5a6a7e",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  expandedDescription: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#202c76",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  descriptionText: {
    fontSize: 14,
    color: "#5a6a7e",
    lineHeight: 20,
    paddingLeft: 58,
  },
  notificationRead: {
    backgroundColor: "#f8f9fa",
    opacity: 0.9,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8ecf4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2a44",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: "#5a6a7e",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2a44",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#5a6a7e",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationCenterScreen;
