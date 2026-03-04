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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FeedPost from "../../Community/FeedPost";
import { getPostsByUser, deletePost, patchPost, getPost } from "../../Services/postsApi";
import type { PostResponse, PostComment } from "../../Services/postsApi";

const GAP = 2;

type ProfileTab = "posts" | "texts";

interface ProfilePostsSectionProps {
  subId: string;
  currentUserId?: string | null;
  nemesisSubIds?: string[];
}

const getImageUrl = (raw?: string | null) => {
  if (!raw || !String(raw).trim()) return undefined;
  return raw.startsWith("http") ? raw : `https://${raw}`;
};

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  subId,
  currentUserId,
  nemesisSubIds = [],
}) => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [allPosts, setAllPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [patching, setPatching] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [modalComments, setModalComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const imagePosts = allPosts.filter((p) => p.imageLink && String(p.imageLink).trim());
  const textPosts = allPosts.filter((p) => !p.imageLink || !String(p.imageLink).trim());
  const displayedPosts = activeTab === "posts" ? imagePosts : textPosts;

  const loadPosts = useCallback(async () => {
    if (!subId) return;
    setLoading(true);
    try {
      const res = await getPostsByUser(subId);
      const posts = res.content ?? [];
      setAllPosts(posts);
      setLikedPosts(new Set(posts.filter((p) => p.userLiked).map((p) => p.postId)));
    } catch {
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  }, [subId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (selectedPost) {
      setShowComments(false);
      setModalComments(selectedPost.comments ?? []);
    }
  }, [selectedPost?.postId]);

  const handleUserPress = (userId: string) => {
    navigation.navigate("UserProfile", { subId: userId });
  };

  const handlePostDeleted = (postId: number) => {
    setAllPosts((prev) => prev.filter((p) => p.postId !== postId));
    setSelectedPost(null);
  };

  const updatePostInState = useCallback((postId: number, updates: Partial<PostResponse>) => {
    setAllPosts((prev) =>
      prev.map((p) => (p.postId === postId ? { ...p, ...updates } : p))
    );
    setSelectedPost((prev) =>
      prev?.postId === postId ? (prev ? { ...prev, ...updates } : null) : prev
    );
  }, []);

  const handleLikePress = async () => {
    if (!selectedPost || patching || !currentUserId) return;
    const isLiked = likedPosts.has(selectedPost.postId);
    const newLiked = !isLiked;
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (newLiked) next.add(selectedPost.postId);
      else next.delete(selectedPost.postId);
      return next;
    });
    updatePostInState(selectedPost.postId, {
      likeCount: selectedPost.likeCount + (newLiked ? 1 : -1),
    });
    setPatching(true);
    try {
      const updated = await patchPost(selectedPost.postId, { like: newLiked });
      updatePostInState(selectedPost.postId, {
        likeCount: updated.likeCount,
        userLiked: updated.userLiked,
      });
      if (updated.userLiked !== undefined) {
        setLikedPosts((prev) => {
          const next = new Set(prev);
          if (updated.userLiked) next.add(selectedPost.postId);
          else next.delete(selectedPost.postId);
          return next;
        });
      }
    } catch {
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(selectedPost.postId);
        else next.delete(selectedPost.postId);
        return next;
      });
      updatePostInState(selectedPost.postId, { likeCount: selectedPost.likeCount });
    } finally {
      setPatching(false);
    }
  };

  const handleCommentButtonPress = async () => {
    const next = !showComments;
    setShowComments(next);
    if (!next || !selectedPost) return;
    if (selectedPost.comments?.length) {
      setModalComments(selectedPost.comments);
    } else if (selectedPost.commentCount > 0) {
      setLoadingComments(true);
      try {
        const fullPost = await getPost(selectedPost.postId);
        setModalComments(fullPost.comments ?? []);
        updatePostInState(selectedPost.postId, { comments: fullPost.comments });
      } catch {
        // keep empty
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleCommentSubmit = async () => {
    const text = commentDraft.trim();
    if (!selectedPost || patching || !text) return;
    setPatching(true);
    try {
      const updated = await patchPost(selectedPost.postId, { comment: text });
      updatePostInState(selectedPost.postId, {
        commentCount: updated.commentCount,
        comments: updated.comments,
      });
      if (updated.comments) setModalComments(updated.comments);
      setCommentDraft("");
    } catch {
      Alert.alert("Error", "Failed to add comment.");
    } finally {
      setPatching(false);
    }
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
      nemesisSubIds={nemesisSubIds}
      onUserPress={handleUserPress}
      onDeleted={handlePostDeleted}
      onUpdated={updatePostInState}
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
        onRequestClose={() => {
          setSelectedPost(null);
          setCommentDraft("");
          setShowComments(false);
          setModalComments([]);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setSelectedPost(null);
            setCommentDraft("");
            setShowComments(false);
            setModalComments([]);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardView}
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
                      <TouchableOpacity
                        style={styles.modalActionButton}
                        onPress={handleLikePress}
                        disabled={patching || !currentUserId}
                      >
                        <Ionicons
                          name={likedPosts.has(selectedPost.postId) ? "heart" : "heart-outline"}
                          size={22}
                          color={likedPosts.has(selectedPost.postId) ? "#e74c3c" : "#5a6a7e"}
                        />
                        <Text style={styles.modalActionCount}>{selectedPost.likeCount}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalActionButton}
                        onPress={handleCommentButtonPress}
                        disabled={!currentUserId}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={20}
                          color="#5a6a7e"
                          style={styles.modalCommentIcon}
                        />
                        <Text style={styles.modalActionCount}>{selectedPost.commentCount}</Text>
                      </TouchableOpacity>
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
                    {showComments && (
                      <View style={styles.modalCommentsSection}>
                        {loadingComments ? (
                          <Text style={styles.modalCommentsLoading}>Loading comments...</Text>
                        ) : modalComments.length > 0 ? (
                          <View style={styles.modalCommentsList}>
                            {modalComments.map((c, i) => {
                              const text = c.text ?? c.content ?? "";
                              const username = c.user?.username ?? c.username ?? "User";
                              return (
                                <View key={c.id ?? i} style={styles.modalCommentItem}>
                                  <Text style={styles.modalCommentUsername}>{username}</Text>
                                  <Text style={styles.modalCommentText}>{text}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : selectedPost.commentCount === 0 ? (
                          <Text style={styles.modalCommentsEmpty}>No comments yet</Text>
                        ) : null}
                      </View>
                    )}
                    {currentUserId && (
                      <View style={styles.commentInputRow}>
                        <TextInput
                          style={styles.commentInput}
                          placeholder="Add a comment..."
                          placeholderTextColor="#9aa6bd"
                          value={commentDraft}
                          onChangeText={setCommentDraft}
                          multiline
                          maxLength={500}
                          editable={!patching}
                        />
                        <TouchableOpacity
                          style={[
                            styles.commentPostButton,
                            (!commentDraft.trim() || patching) && styles.commentPostButtonDisabled,
                          ]}
                          onPress={handleCommentSubmit}
                          disabled={!commentDraft.trim() || patching}
                        >
                          <Text
                            style={[
                              styles.commentPostText,
                              (!commentDraft.trim() || patching) && styles.commentPostTextDisabled,
                            ]}
                          >
                            Post
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
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
  modalKeyboardView: {
    width: "100%",
    maxWidth: 400,
  },
  modalDetails: {
    padding: 16,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  modalActionCount: {
    fontSize: 15,
    color: "#5a6a7e",
    fontWeight: "500",
  },
  modalCommentIcon: {
    marginLeft: 16,
  },
  modalCommentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8ecf4",
  },
  modalCommentsList: {
    marginBottom: 12,
  },
  modalCommentItem: {
    marginBottom: 8,
  },
  modalCommentUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
  },
  modalCommentText: {
    fontSize: 14,
    color: "#0f1724",
    lineHeight: 20,
    marginTop: 2,
  },
  modalCommentsLoading: {
    fontSize: 14,
    color: "#9aa6bd",
    marginBottom: 8,
  },
  modalCommentsEmpty: {
    fontSize: 14,
    color: "#9aa6bd",
    marginBottom: 8,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f5f6f8",
    borderRadius: 12,
    fontSize: 15,
    color: "#0f1724",
  },
  commentPostButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  commentPostButtonDisabled: {
    opacity: 0.5,
  },
  commentPostText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2a44",
  },
  commentPostTextDisabled: {
    color: "#9aa6bd",
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
