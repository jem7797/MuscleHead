import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "../Services/notificationsApi";

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

const getNotificationMessage = (n: Notification): string => {
  const actor = n.actor?.username ?? "Someone";
  const type = (n.type ?? "").toUpperCase();
  switch (type) {
    case "FOLLOW":
      return `${actor} started following you`;
    case "LIKE":
      return `${actor} liked your post`;
    case "COMMENT":
      return `${actor} commented on your post`;
    case "WORKOUT":
      return `${actor} logged a new workout`;
    default:
      return `${actor} interacted with you`;
  }
};

const getPfpUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `https://${url}`;
};

const PAGE_SIZE = 20;

const NotificationCenterScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);

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

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

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
    const subId = n.actor?.subId;
    if (!n.read) {
      try {
        await markNotificationAsRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
      } catch {}
    }
    if (subId) navigation.navigate("UserProfile", { subId });
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const actor = item.actor?.username ?? "User";
    const pfpUrl = getPfpUrl(item.actor?.profilePicUrl);
    const message = getNotificationMessage(item);
    const timeAgo = formatTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, item.read && styles.notificationRead]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          {pfpUrl ? (
            <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{actor.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9aa6bd" />
      </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8ecf4",
  },
  notificationRead: {
    backgroundColor: "#f8f9fa",
    opacity: 0.9,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#202c76",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
