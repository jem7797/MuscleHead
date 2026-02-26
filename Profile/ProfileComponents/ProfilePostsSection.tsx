import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FeedPost from "../../Community/FeedPost";
import { getPostsByUser, deletePost } from "../../Services/postsApi";
import type { PostResponse } from "../../Services/postsApi";

const GAP = 2;

type ProfileTab = "posts" | "texts";

interface ProfilePostsSectionProps {
  subId: string;
  currentUserId?: string | null;
}

const getImageUrl = (raw?: string | null) => {
  if (!raw || !String(raw).trim()) return undefined;
  return raw.startsWith("http") ? raw : `https://${raw}`;
};

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  subId,
  currentUserId,
}) => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [allPosts, setAllPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const imagePosts = allPosts.filter((p) => p.imageLink && String(p.imageLink).trim());
  const textPosts = allPosts.filter((p) => !p.imageLink || !String(p.imageLink).trim());
  const displayedPosts = activeTab === "posts" ? imagePosts : textPosts;

  const loadPosts = useCallback(async () => {
    if (!subId) return;
    setLoading(true);
    try {
      const res = await getPostsByUser(subId);
      setAllPosts(res.content ?? []);
    } catch {
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  }, [subId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleUserPress = (userId: string) => {
    navigation.navigate("UserProfile", { subId: userId });
  };

  const handlePostDeleted = (postId: number) => {
    setAllPosts((prev) => prev.filter((p) => p.postId !== postId));
    setSelectedPost(null);
  };

  const handleDeletePost = () => {
    if (!selectedPost || deleting) return;
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deletePost(selectedPost.postId);
            handlePostDeleted(selectedPost.postId);
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete post.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const postOwnerSubId = selectedPost?.user?.subId ?? (selectedPost?.user as { sub_id?: string })?.sub_id;
  const isOwnPost = !!currentUserId && postOwnerSubId === currentUserId;

  const renderPost = ({ item }: { item: PostResponse }) => (
    <FeedPost
      post={item}
      currentUserId={currentUserId}
      onUserPress={handleUserPress}
      onDeleted={handlePostDeleted}
    />
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons
        name={activeTab === "posts" ? "images-outline" : "chatbubble-outline"}
        size={40}
        color="#9aa6bd"
      />
      <Text style={styles.emptyText}>
        {activeTab === "posts" ? "No image posts yet" : "No text posts yet"}
      </Text>
    </View>
  );

  const renderPostsGrid = () => (
    <View style={styles.grid}>
      {imagePosts.map((post) => {
        const uri = getImageUrl(post.imageLink);
        return (
          <TouchableOpacity
            key={post.postId}
            style={styles.gridItem}
            onPress={() => setSelectedPost(post)}
            activeOpacity={0.9}
          >
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.gridImage, styles.gridImagePlaceholder]}>
                <Ionicons name="image-outline" size={32} color="#9aa6bd" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "posts" && styles.tabActive]}
          onPress={() => setActiveTab("posts")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={activeTab === "posts" ? "#1f2a44" : "#9aa6bd"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "posts" && styles.tabLabelActive,
            ]}
          >
            Posts
          </Text>
          {activeTab === "posts" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "texts" && styles.tabActive]}
          onPress={() => setActiveTab("texts")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={activeTab === "texts" ? "#1f2a44" : "#9aa6bd"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "texts" && styles.tabLabelActive,
            ]}
          >
            Texts
          </Text>
          {activeTab === "texts" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#1f2a44" />
        </View>
      ) : displayedPosts.length === 0 ? (
        renderEmpty()
      ) : activeTab === "posts" ? (
        renderPostsGrid()
      ) : (
        <View style={styles.list}>
          {textPosts.map((item) => (
            <View key={String(item.postId)}>{renderPost({ item })}</View>
          ))}
        </View>
      )}

      <Modal
        visible={!!selectedPost}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPost(null)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            {selectedPost && (
              <>
                <View style={styles.modalImageWrapper}>
                  {getImageUrl(selectedPost.imageLink) ? (
                    <Image
                      source={{ uri: getImageUrl(selectedPost.imageLink)! }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                      <Ionicons name="image-outline" size={64} color="#9aa6bd" />
                    </View>
                  )}
                </View>
                <View style={styles.modalDetails}>
                  <View style={styles.modalActions}>
                    <Ionicons name="heart-outline" size={22} color="#5a6a7e" />
                    <Text style={styles.modalActionCount}>{selectedPost.likeCount}</Text>
                    <Ionicons name="chatbubble-outline" size={20} color="#5a6a7e" style={styles.modalCommentIcon} />
                    <Text style={styles.modalActionCount}>{selectedPost.commentCount}</Text>
                    {isOwnPost && (
                      <TouchableOpacity
                        style={styles.modalDeleteButton}
                        onPress={handleDeletePost}
                        disabled={deleting}
                      >
                        <Ionicons name="trash-outline" size={22} color="#8b0000" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {selectedPost.caption?.trim() ? (
                    <Text style={styles.modalCaption}>{selectedPost.caption}</Text>
                  ) : null}
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
    minHeight: 120,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {},
  tabLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9aa6bd",
  },
  tabLabelActive: {
    color: "#1f2a44",
    fontWeight: "600",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: "20%",
    right: "20%",
    height: 2,
    backgroundColor: "#1f2a44",
    borderRadius: 1,
  },
  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginHorizontal: -GAP / 2,
  },
  gridItem: {
    width: "33.333%",
    aspectRatio: 1,
    padding: GAP / 2,
    backgroundColor: "#e8ecf4",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    marginTop: 8,
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#9aa6bd",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalImageWrapper: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1a1a1a",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalDetails: {
    padding: 16,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalActionCount: {
    fontSize: 15,
    color: "#5a6a7e",
    fontWeight: "500",
  },
  modalCommentIcon: {
    marginLeft: 16,
  },
  modalDeleteButton: {
    marginLeft: "auto",
    padding: 8,
  },
  modalCaption: {
    marginTop: 12,
    fontSize: 15,
    color: "#0f1724",
    lineHeight: 22,
  },
});

export default ProfilePostsSection;
