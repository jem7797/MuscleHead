import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PostResponse } from "../Services/postsApi";
import { deletePost } from "../Services/postsApi";

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

const getPfpUrl = (raw?: string) => {
  if (!raw) return undefined;
  return raw.startsWith("http") ? raw : `https://${raw}`;
};

interface FeedPostProps {
  post: PostResponse;
  currentUserId?: string | null;
  onUserPress?: (subId: string) => void;
  onDeleted?: (postId: number) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, currentUserId, onUserPress, onDeleted }) => {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const postOwnerSubId = post.user?.subId ?? (post.user as { sub_id?: string })?.sub_id;
  const isOwnPost = !!currentUserId && postOwnerSubId === currentUserId;

  const handleDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deletePost(post.postId);
            onDeleted?.(post.postId);
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
  const displayName = post.user?.username ?? "User";
  const pfpUrl = getPfpUrl(post.user?.profilePicUrl);

  if (!hasImage) {
    return (
      <View style={styles.textBubbleCard}>
        <TouchableOpacity
          style={styles.textBubble}
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
              <Text style={styles.username}>{displayName}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
            </View>
            {hasCaption && <Text style={styles.bubbleText}>{post.caption}</Text>}
            <View style={styles.textBubbleActions}>
              <Ionicons name="heart-outline" size={18} color="#5a6a7e" />
              <Text style={styles.actionCount}>{post.likeCount}</Text>
              <Ionicons name="chatbubble-outline" size={16} color="#5a6a7e" style={styles.commentIcon} />
              <Text style={styles.actionCount}>{post.commentCount}</Text>
              {isOwnPost && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  <Ionicons name="trash-outline" size={18} color="#8b0000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.textBubbleCard}>
      <TouchableOpacity
        style={styles.imageBubble}
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
            <Text style={styles.username}>{displayName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
          </View>
          {!imgError ? (
            <Image
              source={{ uri: post.imageLink! }}
              style={styles.bubbleImage}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.bubbleImage, styles.imageError]}>
              <Ionicons name="image-outline" size={48} color="#9aa6bd" />
            </View>
          )}
          {hasCaption && <Text style={styles.bubbleText}>{post.caption}</Text>}
          <View style={styles.textBubbleActions}>
            <Ionicons name="heart-outline" size={18} color="#5a6a7e" />
            <Text style={styles.actionCount}>{post.likeCount}</Text>
            <Ionicons name="chatbubble-outline" size={16} color="#5a6a7e" style={styles.commentIcon} />
            <Text style={styles.actionCount}>{post.commentCount}</Text>
            {isOwnPost && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Ionicons name="trash-outline" size={18} color="#8b0000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
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
  commentIcon: {
    marginLeft: 16,
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
