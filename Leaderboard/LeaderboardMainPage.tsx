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
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "../Services/notificationsApi";
import { createAchievementPost } from "../Services/postsApi";

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

const isAchievement = (n: Notification) =>
  (n.type ?? "").toUpperCase() === "MEDAL_EARNED";

const PAGE_SIZE = 20;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NotificationCenterScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [postingMedalId, setPostingMedalId] = useState<number | null>(null);

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
    setNotifications((prev) => (append ? [...prev, ...result.content] : result.content));
    setTotalElements(result.totalElements);
    setPage(pageNum);
    return result;
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchNotifications(0, false);
    setLoading(false);
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [loadInitial])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(0, false);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    const hasMore = notifications.length < totalElements;
    if (loadingMore || !hasMore || totalElements === 0) return;
    setLoadingMore(true);
    await fetchNotifications(page + 1, true);
    setLoadingMore(false);
  };

  const handleNotificationPress = async (n: Notification) => {
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

  const renderItem = ({ item }: { item: Notification }) => {
    const timeAgo = formatTimeAgo(item.createdAt);
    const icon = getIconForType(item.type);
    const achievement = isAchievement(item);
    const expanded = expandedIds.has(item.id);
    const rawDisplayName = achievement
      ? (item.medalName ?? item.message ?? "Achievement unlocked!")
      : item.message;
    const displayName = achievement ? rawDisplayName.replace(/_/g, " ") : rawDisplayName;
    const rawDescription = achievement
      ? (item.medalDescription ?? item.message)
      : null;
    const description = rawDescription ? rawDescription.replace(/_/g, " ") : rawDescription;

    return (
      <View style={[styles.notificationCard, item.read && styles.notificationRead]}>
        <TouchableOpacity
          style={styles.notificationRow}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              achievement && styles.achievementIconWrapper,
            ]}
          >
            <Ionicons
              name={icon as React.ComponentProps<typeof Ionicons>["name"]}
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
            {item.medalId != null && (
              <TouchableOpacity
                style={[styles.shareButton, postingMedalId === item.id && styles.shareButtonDisabled]}
                onPress={() => handleShareAchievement(item)}
                disabled={postingMedalId != null}
              >
                <Ionicons name="share-social-outline" size={16} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {postingMedalId === item.id ? "Posting..." : "Share to Feed"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  if (loading && notifications.length === 0) {
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
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color="#a2a2a2" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            When someone follows you or interacts with your content, you'll see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
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
