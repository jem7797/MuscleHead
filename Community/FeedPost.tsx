import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PostResponse, PostComment } from "../Services/postsApi";
import { deletePost, patchPost, getPost } from "../Services/postsApi";
import { getProfilePicUrl } from "../utils/profilePicUrl";
import { useUser } from "../Contexts/UserContext";
import { Image } from "expo-image";

const formatTimestamp = (ts: string) => {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
};

const NEMESIS_BG = "#8b0000";

interface FeedPostProps {
  post: PostResponse;
  currentUserId?: string | null;
  nemesisSubIds?: string[];
  onUserPress?: (subId: string) => void;
  onDeleted?: (postId: number) => void;
  onUpdated?: (postId: number, updates: Partial<PostResponse>) => void;
}

const normalizeId = (id: string) => String(id ?? "").trim().toLowerCase();

const getPostId = (p: PostResponse) => p.postId ?? (p as { post_id?: number }).post_id;

const FeedPost: React.FC<FeedPostProps> = ({ post, currentUserId, nemesisSubIds = [], onUserPress, onDeleted, onUpdated }) => {
  const { pfpLink } = useUser();
  const postId = getPostId(post);
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(!!post.userLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [patching, setPatching] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState<PostComment[]>(post.comments ?? []);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (patching) return; // Don't overwrite during our own like/unlike - prevents flash
    setLiked(!!post.userLiked);
    setLikeCount(post.likeCount);
    setCommentCount(post.commentCount);
    setComments(post.comments ?? []);
  }, [postId, post.userLiked, post.likeCount, post.commentCount, post.comments, patching]);

  const postOwnerSubId = post.user?.subId ?? (post.user as { sub_id?: string })?.sub_id;
  const isOwnPost = !!currentUserId && postOwnerSubId === currentUserId;
  const isNemesisPost = !!postOwnerSubId && nemesisSubIds.some((id) => normalizeId(id) === normalizeId(postOwnerSubId));
  const bubbleBg = isNemesisPost ? { backgroundColor: NEMESIS_BG } : undefined;
  const nemesisText = isNemesisPost ? { color: "#fff" } : undefined;
  const nemesisMuted = isNemesisPost ? { color: "#f5c6c6" } : undefined;

  const handleLike = async () => {
    if (!currentUserId || patching) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    setPatching(true);
    try {
      const updated = await patchPost(postId, { like: newLiked });
      setLikeCount(updated.likeCount);

      setLiked(updated.userLiked !== undefined ? !!updated.userLiked : newLiked);
      onUpdated?.(postId, { likeCount: updated.likeCount, userLiked: updated.userLiked ?? newLiked });
    } catch {
      setLiked(liked);
      setLikeCount(post.likeCount);
    } finally {
      setPatching(false);
    }
  };

  const handleCommentButtonPress = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0 && commentCount > 0) {
      setLoadingComments(true);
      try {
        const fullPost = await getPost(postId);
        setComments(fullPost.comments ?? []);
        onUpdated?.(postId, { comments: fullPost.comments });
      } catch {
        // keep comments empty
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleCommentSubmit = async () => {
    const text = commentDraft.trim();
    if (!currentUserId || patching || !text) return;
    setPatching(true);
    try {
      const updated = await patchPost(postId, { comment: text });
      setCommentCount(updated.commentCount);
      setCommentDraft("");
      if (updated.comments) setComments(updated.comments);
      onUpdated?.(postId, { commentCount: updated.commentCount, comments: updated.comments });
    } catch {
      Alert.alert("Error", "Failed to add comment.");
    } finally {
      setPatching(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deletePost(postId);
            onDeleted?.(postId);
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete post.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };
  const hasImage = !!(post.imageLink && post.imageLink.trim());
  const hasCaption = !!(post.caption && post.caption.trim());
  const isTrophy = post.isTrophy === true || post.trophy === true;
  const medalName = post.medalName ?? (post as { medal_name?: string }).medal_name ?? "";
  const formattedMedal = medalName ? medalName.replace(/_/g, " ").trim() : "";
  const trophyDisplayName = formattedMedal || (post as { achievementName?: string }).achievementName || "Achievement";
  const displayName = post.user?.username ?? "User";
  const pfpUrl = isOwnPost && pfpLink ? pfpLink : getProfilePicUrl(post.user);

  const actionColor = isNemesisPost ? "#f5c6c6" : "#5a6a7e";
  const renderActions = () => (
    <View style={styles.textBubbleActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleLike}
        disabled={!currentUserId || patching}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={18}
          color={liked ? "#e74c3c" : actionColor}
        />
        <Text style={[styles.actionCount, isNemesisPost && nemesisMuted]}>{likeCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCommentButtonPress}
        disabled={!currentUserId}
      >
        <Ionicons name="chatbubble-outline" size={16} color={actionColor} style={styles.commentIcon} />
        <Text style={[styles.actionCount, isNemesisPost && nemesisMuted]}>{commentCount}</Text>
      </TouchableOpacity>
      {isOwnPost && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={18} color={isNemesisPost ? "#fff" : "#8b0000"} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isTrophy) {
    return (
      <View style={[styles.textBubbleCard, styles.trophyCardBorder]}>
        <TouchableOpacity
          style={[styles.achievementBubble, bubbleBg]}
          onPress={() => post.user?.subId && onUserPress?.(post.user.subId)}
          activeOpacity={0.7}
        >
          {pfpUrl ? (
            <Image source={{ uri: pfpUrl }} style={styles.bubbleAvatar} />
          ) : (
            <View style={[styles.bubbleAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.bubbleContent}>
            <View style={styles.bubbleHeader}>
              <Text style={[styles.username, nemesisText]}>{displayName}</Text>
              <Text style={[styles.timestamp, nemesisMuted]}>{formatTimestamp(post.timestamp)}</Text>
            </View>
            <View style={styles.achievementBanner}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.achievementBannerText}>{trophyDisplayName}</Text>
            </View>
            {renderActions()}
          </View>
        </TouchableOpacity>
        {showComments && (
          <View style={[styles.commentsSection, isNemesisPost && styles.commentsSectionNemesis]}>
            {loadingComments ? (
              <Text style={styles.commentsLoading}>Loading comments...</Text>
            ) : comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((c, i) => {
                  const text = c.text ?? c.content ?? "";
                  const username = c.user?.username ?? c.username ?? "User";
                  return (
                    <View key={c.id ?? i} style={styles.commentItem}>
                      <Text style={styles.commentUsername}>{username}</Text>
                      <Text style={styles.commentText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ) : commentCount === 0 ? (
              <Text style={styles.commentsEmpty}>No comments yet</Text>
            ) : null}
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
                  style={[styles.commentPostBtn, (!commentDraft.trim() || patching) && styles.commentPostBtnDisabled]}
                  onPress={handleCommentSubmit}
                  disabled={!commentDraft.trim() || patching}
                >
                  <Text style={styles.commentPostBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  if (!hasImage) {
    return (
      <View style={styles.textBubbleCard}>
        <TouchableOpacity
          style={[styles.textBubble, bubbleBg]}
          onPress={() => post.user?.subId && onUserPress?.(post.user.subId)}
          activeOpacity={0.7}
        >
          {pfpUrl ? (
            <Image source={{ uri: pfpUrl }} style={styles.bubbleAvatar} />
          ) : (
            <View style={[styles.bubbleAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.bubbleContent}>
            <View style={styles.bubbleHeader}>
              <Text style={[styles.username, nemesisText]}>{displayName}</Text>
              <Text style={[styles.timestamp, nemesisMuted]}>{formatTimestamp(post.timestamp)}</Text>
            </View>
            {hasCaption && <Text style={[styles.bubbleText, nemesisText]}>{post.caption}</Text>}
            {renderActions()}
          </View>
        </TouchableOpacity>
        {showComments && (
          <View style={[styles.commentsSection, isNemesisPost && styles.commentsSectionNemesis]}>
            {loadingComments ? (
              <Text style={styles.commentsLoading}>Loading comments...</Text>
            ) : comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((c, i) => {
                  const text = c.text ?? c.content ?? "";
                  const username = c.user?.username ?? c.username ?? "User";
                  return (
                    <View key={c.id ?? i} style={styles.commentItem}>
                      <Text style={styles.commentUsername}>{username}</Text>
                      <Text style={styles.commentText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ) : commentCount === 0 ? (
              <Text style={styles.commentsEmpty}>No comments yet</Text>
            ) : null}
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
              style={[styles.commentPostBtn, (!commentDraft.trim() || patching) && styles.commentPostBtnDisabled]}
              onPress={handleCommentSubmit}
              disabled={!commentDraft.trim() || patching}
            >
              <Text style={styles.commentPostBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.textBubbleCard}>
      <TouchableOpacity
        style={[styles.imageBubble, bubbleBg]}
        onPress={() => post.user?.subId && onUserPress?.(post.user.subId)}
        activeOpacity={0.7}
      >
        {pfpUrl ? (
          <Image source={{ uri: pfpUrl }} style={styles.bubbleAvatar} />
        ) : (
          <View style={[styles.bubbleAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.bubbleContent}>
          <View style={styles.bubbleHeader}>
            <Text style={[styles.username, nemesisText]}>{displayName}</Text>
            <Text style={[styles.timestamp, nemesisMuted]}>{formatTimestamp(post.timestamp)}</Text>
          </View>
          {!imgError ? (
            <Image
              source={{ uri: post.imageLink! }}
              style={styles.bubbleImage}
              contentFit="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.bubbleImage, styles.imageError]}>
              <Ionicons name="image-outline" size={48} color="#9aa6bd" />
            </View>
          )}
          {hasCaption && <Text style={[styles.bubbleText, nemesisText]}>{post.caption}</Text>}
          {renderActions()}
        </View>
      </TouchableOpacity>
      {showComments && (
        <View style={[styles.commentsSection, isNemesisPost && styles.commentsSectionNemesis]}>
          {loadingComments ? (
            <Text style={styles.commentsLoading}>Loading comments...</Text>
          ) : comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.map((c, i) => {
                const text = c.text ?? c.content ?? "";
                const username = c.user?.username ?? c.username ?? "User";
                return (
                  <View key={c.id ?? i} style={styles.commentItem}>
                    <Text style={styles.commentUsername}>{username}</Text>
                    <Text style={styles.commentText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          ) : commentCount === 0 ? (
            <Text style={styles.commentsEmpty}>No comments yet</Text>
          ) : null}
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
            style={[styles.commentPostBtn, (!commentDraft.trim() || patching) && styles.commentPostBtnDisabled]}
            onPress={handleCommentSubmit}
            disabled={!commentDraft.trim() || patching}
          >
            <Text style={styles.commentPostBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#708090",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  textBubbleCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  deleteButton: {
    marginLeft: "auto",
    marginTop: -4,
    padding: 8,
  },
  textBubble: {
    flexDirection: "row",
    backgroundColor: "#f5f6f8",
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  trophyCardBorder: {
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 16,
    overflow: "hidden",
  },
  achievementBubble: {
    flexDirection: "row",
    backgroundColor: "#faf8f0",
    padding: 12,
    borderRadius: 14,
    borderTopLeftRadius: 2,
  },
  achievementBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  achievementBannerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
  },
  bubbleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#708090",
  },
  bubbleContent: {
    flex: 1,
    marginLeft: 12,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f1724",
  },
  timestamp: {
    fontSize: 12,
    color: "#9aa6bd",
  },
  bubbleText: {
    fontSize: 15,
    color: "#0f1724",
    lineHeight: 22,
    marginTop: 4,
  },
  textBubbleActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
    paddingRight: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  commentIcon: {
    marginLeft: 16,
  },
  commentsSection: {
    marginTop: 8,
    marginLeft: 52,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e8ecf4",
  },
  commentsSectionNemesis: {
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  commentsList: {
    marginBottom: 8,
  },
  commentItem: {
    marginBottom: 6,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f1724",
  },
  commentText: {
    fontSize: 14,
    color: "#0f1724",
    lineHeight: 20,
    marginTop: 2,
  },
  commentsLoading: {
    fontSize: 13,
    color: "#9aa6bd",
    marginBottom: 8,
  },
  commentsEmpty: {
    fontSize: 13,
    color: "#9aa6bd",
    marginBottom: 8,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f6f8",
    borderRadius: 12,
    fontSize: 14,
    color: "#0f1724",
  },
  commentPostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  commentPostBtnDisabled: {
    opacity: 0.5,
  },
  commentPostBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
  },
  actionCount: {
    fontSize: 13,
    color: "#5a6a7e",
  },

  imageBubble: {
    flexDirection: "row",
    backgroundColor: "#f5f6f8",
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  bubbleImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e8ecf4",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  imageError: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FeedPost;
