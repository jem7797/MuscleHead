import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";
import FeedPost from "./FeedPost";
import { getFeed } from "../Services/postsApi";
import type { PostResponse } from "../Services/postsApi";
import { useUser } from "../Contexts/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  accent,
  accentBright,
  accentDeep,
  borderSubtle,
  screenBackground,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../theme/colors";

const PAGE_SIZE = 20;

const CommunityScreen = () => {
  const navigation = useNavigation<any>();
  const { userId: currentUserId, nemesisSubIds, feedInvalidationTrigger } = useUser();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) {
      if (append) setRefreshing(true);
      else setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const res = await getFeed(pageNum, PAGE_SIZE);
      const content = Array.isArray(res.content) ? res.content : [];
      if (append) {
        setPosts((prev) => (pageNum === 0 ? content : [...prev, ...content]));
      } else {
        setPosts(content);
      }
      setPage(res.number);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeed(0, false);
    }, [loadFeed])
  );

  useEffect(() => {
    if (feedInvalidationTrigger > 0) loadFeed(0, false);
  }, [feedInvalidationTrigger, loadFeed]);

  const handleRefresh = () => loadFeed(0, true);
  const handleLoadMore = () => {
    if (!loadingMore && page + 1 < totalPages) loadFeed(page + 1, true);
  };

  const handleCreatePost = () => {
    navigation.navigate("CreatePost");
  };

  const handleUserPress = (subId: string) => {
    navigation.navigate("UserProfile", { subId });
  };

  const getPostId = (p: PostResponse) => p.postId ?? (p as { post_id?: number }).post_id;

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => getPostId(p) !== postId));
    // Refresh feed in background to ensure sync with server
    loadFeed(0, true);
  };

  const handlePostUpdated = (postId: number, updates: Partial<PostResponse>) => {
    setPosts((prev) =>
      prev.map((p) => (getPostId(p) === postId ? { ...p, ...updates } : p))
    );
  };

  const renderPost = ({ item }: { item: PostResponse }) => (
    <FeedPost
      post={item}
      currentUserId={currentUserId}
      nemesisSubIds={nemesisSubIds}
      onUserPress={handleUserPress}
      onDeleted={handlePostDeleted}
      onUpdated={handlePostUpdated}
    />
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={accent} />
      </View>
    ) : null;

  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleCreatePost} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={22} color={accent} />
            </TouchableOpacity>
            <Text style={styles.title}>Community</Text>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate("FriendsList")}
              activeOpacity={0.7}
              accessibilityLabel="Friends"
            >
              <Ionicons name="people" size={22} color={accent} />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={[accentDeep, accentBright, accent]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.headerAccent}
          />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accent} />
        </View>
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleCreatePost}
            activeOpacity={0.7}
            accessibilityLabel="Create post"
          >
            <Ionicons name="create-outline" size={22} color={accent} />
          </TouchableOpacity>
          <Text style={styles.title}>Community</Text>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate("FriendsList")}
            activeOpacity={0.7}
            accessibilityLabel="Friends"
          >
            <Ionicons name="people" size={22} color={accent} />
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={[accentDeep, accentBright, accent]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.headerAccent}
        />
      </View>
      {error && posts.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={textSecondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFeed(0)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(getPostId(item))}
          renderItem={renderPost}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={48} color={textSecondary} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Follow users or create a post to see them here</Text>
            </View>
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={accent} />
          }
          contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
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
    backgroundColor: screenBackground,
  },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: borderSubtle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerAccent: {
    height: 3,
    width: "100%",
  },
  headerIconBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.35,
    color: textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: accent,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    paddingBottom: 120,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: textPrimary,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: textSecondary,
    textAlign: "center",
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

export default CommunityScreen;


