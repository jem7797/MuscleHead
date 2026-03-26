import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import BackButton from "../Components/BackButton";
import StatsRow from "./ProfileComponents/StatsRow";
import BioSection from "./ProfileComponents/BioSection";
import MetricsRow from "./ProfileComponents/MetricsRow";
import ProfilePostsSection from "./ProfileComponents/ProfilePostsSection";
import { getUser, updateUserNemesis, removeNemesis } from "../Services/userApi";
import { follow, unfollow, checkFollow, checkMutualFollow, checkFollowRequestStatus } from "../Services/followApi";
import { createLiveSession, sendInvite } from "../lib/sessionService";
import { useUser } from "../Contexts/UserContext";
import { getProfilePicUrl } from "../utils/profilePicUrl";
import { Image } from "expo-image";

const formatHeight = (totalInches?: number | null) => {
  if (totalInches === undefined || totalInches === null) return "N/A";
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

/** Normalize IDs for comparison (handles sub_id vs subId, casing, etc.) */
const normalizeId = (id: string) => String(id ?? "").trim().toLowerCase();

const UserProfileScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId: currentUserId, addToFollowingCount, nemesisSubIds, setNemesisSubIds, refreshUserProfile, pfpLink } = useUser();
  const subId = route.params?.subId ?? route.params?.sub_id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [nemesisLoading, setNemesisLoading] = useState(false);
  const [nemesisModalVisible, setNemesisModalVisible] = useState(false);
  const [nemesisModalMode, setNemesisModalMode] = useState<"add" | "remove">("add");
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchUser = useCallback(() => {
    if (!subId) {
      setError("No user specified");
      setLoading(false);
      return () => {};
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    getUser(subId)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subId]);

  useEffect(() => {
    return fetchUser();
  }, [fetchUser]);

  useFocusEffect(
    useCallback(() => {
      if (subId) fetchUser();
    }, [subId, fetchUser])
  );

  useEffect(() => {
    if (!subId || !currentUserId || subId === currentUserId) return;
    let cancelled = false;
    Promise.all([
      checkFollow(currentUserId, subId),
      checkFollowRequestStatus(currentUserId, subId),
    ]).then(([following, reqStatus]) => {
      if (!cancelled) {
        setIsFollowing(following);
        setRequestPending(!following && reqStatus === "pending");
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [subId, currentUserId]);

  useEffect(() => {
    if (!subId || !currentUserId || subId === currentUserId || !isFollowing) {
      setIsMutualFollow(false);
      return;
    }
    let cancelled = false;
    checkMutualFollow(currentUserId, subId)
      .then((mutual) => {
        if (!cancelled) setIsMutualFollow(mutual);
      })
      .catch(() => {
        if (!cancelled) setIsMutualFollow(false);
      });
    return () => { cancelled = true; };
  }, [subId, currentUserId, isFollowing]);

  const isNemesis = subId ? nemesisSubIds.some((id) => normalizeId(id) === normalizeId(subId)) : false;

  const handleFollowPress = async () => {
    if (!subId || followLoading) return;
    setFollowLoading(true);
    console.log("[Follow UI] Follow button pressed, subId:", subId);
    try {
      if (isFollowing) {
        addToFollowingCount(-1);
        setUser((prev: { number_of_followers?: number } | null) => prev && { ...prev, number_of_followers: Math.max(0, (prev.number_of_followers ?? 0) - 1) });
        await unfollow(subId);
        setIsFollowing(false);
        setRequestPending(false);
        console.log("[Follow UI] State change: unfollowed");
      } else if (requestPending) {
        // Can't cancel request from UI; do nothing
      } else {
        await follow(subId);
        console.log("[Follow UI] Follow API completed, checking follow status...");
        const [nowFollowing, reqStatus] = await Promise.all([
          checkFollow(currentUserId!, subId),
          checkFollowRequestStatus(currentUserId!, subId),
        ]);
        console.log("[Follow UI] checkFollow:", nowFollowing, "checkFollowRequestStatus:", reqStatus);
        if (nowFollowing) {
          addToFollowingCount(1);
          setUser((prev: { number_of_followers?: number } | null) => prev && { ...prev, number_of_followers: (prev.number_of_followers ?? 0) + 1 });
          setIsFollowing(true);
          setRequestPending(false);
          console.log("[Follow UI] State change: isFollowing=true");
        } else if (reqStatus === "pending") {
          setRequestPending(true);
          console.log("[Follow UI] State change: requestPending=true");
        } else {
          // Backend may not have updated check yet; optimistically show Following
          addToFollowingCount(1);
          setUser((prev: { number_of_followers?: number } | null) => prev && { ...prev, number_of_followers: (prev.number_of_followers ?? 0) + 1 });
          setIsFollowing(true);
          setRequestPending(false);
          console.log("[Follow UI] State change: optimistically isFollowing=true (check not yet true)");
        }
      }
    } catch (e) {
      console.error("[Follow UI] Follow failed:", e);
      Alert.alert("Follow failed", e instanceof Error ? e.message : "Could not follow. Please try again.");
    } finally {
      setFollowLoading(false);
      console.log("[Follow UI] followLoading set to false");
    }
  };

  const handleInviteToSession = async () => {
    if (!subId || !currentUserId || inviteLoading) return;
    setInviteLoading(true);
    try {
      const session = await createLiveSession();
      console.log('session:', session);
      console.log('sessionId:', session?.id);
      await sendInvite({ sessionId: session.id, toUserId: subId });
      navigation.navigate("MultiplayerWaitingScreen", {
        sessionId: session.id,
        currentUserId,
        hostUserId: currentUserId,
        guestUserId: null,
      });
    } catch (e) {
      console.error("Failed to invite to session:", e);
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not send invite."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleNemesisButtonPress = () => {
    setNemesisModalMode(isNemesis ? "remove" : "add");
    setNemesisModalVisible(true);
  };

  const handleNemesisModalCancel = () => {
    setNemesisModalVisible(false);
  };

  const handleNemesisModalConfirm = async () => {
    if (!subId || !currentUserId || nemesisLoading) return;
    setNemesisLoading(true);
    const isAdding = nemesisModalMode === "add";
    if (isAdding) {
      setNemesisModalVisible(false);
      const alreadyHas = nemesisSubIds.some((id) => normalizeId(id) === normalizeId(subId));
      const newList = alreadyHas ? nemesisSubIds : [...nemesisSubIds, subId];
      setNemesisSubIds(newList);
      try {
        await updateUserNemesis(currentUserId, newList);
      } catch {
        setNemesisSubIds(nemesisSubIds);
      }
    } else {
      setNemesisModalVisible(false);
      try {
        await removeNemesis(currentUserId, subId);
        await refreshUserProfile();
      } catch {
        try {
          await refreshUserProfile();
        } catch {}
      }
    }
    setNemesisLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1f2a44" />
        <NavBar />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.errorText}>{error ?? "User not found"}</Text>
        <NavBar />
      </View>
    );
  }

  const displayName = user.username ?? user.first_name ?? "User";
  const isCurrentUser = subId && currentUserId && subId === currentUserId;
  const pfpUrl = isCurrentUser ? pfpLink : getProfilePicUrl(user);
  const bio = user.bio ?? "No bio yet.";
  const stats = [
    { label: "Following", value: String(user.number_following ?? 0) },
    { label: "Posts", value: String(user.number_of_posts ?? 0) },
    { label: "Followers", value: String(user.number_of_followers ?? 0) },
  ];
  const metrics = [
    { icon: "ruler", value: formatHeight(user.height) },
    { icon: "weight", value: user.weight != null ? `${user.weight} lb` : "N/A" },
    { icon: "syringe", value: user.nattyStatus ? "Natty" : "Not Natty" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        {!isCurrentUser ? (
          <TouchableOpacity
            style={[styles.nemesisButton, isNemesis && styles.nemesisButtonActive]}
            onPress={handleNemesisButtonPress}
            disabled={nemesisLoading}
          >
            <MaterialCommunityIcons
              name="sword-cross"
              size={22}
              color={isNemesis ? "#fff" : "#5a6a7e"}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {pfpUrl ? (
              <Image source={{ uri: pfpUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user.rank?.name && (
            <Text style={styles.rankText}>{user.rank.name}</Text>
          )}
          {!isCurrentUser && (
            <View style={styles.followRow}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                  requestPending && styles.requestedButton,
                ]}
                onPress={handleFollowPress}
                disabled={followLoading || requestPending}
              >
                <Text style={styles.followButtonText}>
                  {followLoading ? "..." : requestPending ? "Requested" : isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
              {isMutualFollow && (
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={handleInviteToSession}
                  disabled={inviteLoading}
                >
                  <Text style={styles.inviteButtonText}>
                    {inviteLoading ? "..." : "Invite to Session"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <StatsRow
          stats={stats}
          onFollowingPress={() => subId && navigation.navigate("FollowList", { subId, mode: "following", displayName })}
          onFollowersPress={() => subId && navigation.navigate("FollowList", { subId, mode: "followers", displayName })}
        />
        <BioSection bio={bio} />
        <View style={styles.metricsSection}>
          <MetricsRow metrics={metrics} />
        </View>
        <ProfilePostsSection subId={subId} currentUserId={currentUserId} nemesisSubIds={nemesisSubIds} />
        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={nemesisModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleNemesisModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrapper}>
              <MaterialCommunityIcons
                name="sword-cross"
                size={48}
                color={nemesisModalMode === "remove" ? "#8b0000" : "#5a6a7e"}
              />
            </View>
            <Text style={styles.modalTitle}>
              {nemesisModalMode === "add" ? "New Nemesis?" : "Peace?"}
            </Text>
            <Text style={styles.modalText}>
              {nemesisModalMode === "add"
                ? `Are you sure you would like to set ${displayName} as a nemesis? This will send notifications to you when they do a workout and when they post`
                : `Are you sure you'd like to remove ${displayName} as a nemesis?` }
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleNemesisModalCancel}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  { backgroundColor: nemesisModalMode === "remove" ? "#8b0000" : "#5a6a7e" },
                ]}
                onPress={handleNemesisModalConfirm}
                disabled={nemesisLoading}
              >
                <Text style={styles.modalButtonConfirmText}>
                  {nemesisModalMode === "add" ? "Set Nemesis" : "Remove Nemesis"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingBottom: 8,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
  },
  displayName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "#0f1724",
  },
  rankText: {
    marginTop: 4,
    fontSize: 14,
    color: "#5a6a7e",
  },
  followRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#1f2a44",
    borderRadius: 10,
  },
  followingButton: {
    backgroundColor: "#5a6a7e",
  },
  requestedButton: {
    backgroundColor: "#9aa6bd",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  inviteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1f2a44",
    borderRadius: 10,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  nemesisButton: {
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: "#e8ecf4",
    alignItems: "center",
    justifyContent: "center",
  },
  nemesisButtonActive: {
    backgroundColor: "#8b0000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalIconWrapper: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: "#5a6a7e",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#e8ecf4",
  },
  modalButtonConfirm: {
    backgroundColor: "#1f2a44",
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5a6a7e",
  },
  modalButtonConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#5a6a7e",
  },
  metricsSection: {
    width: "100%",
    marginTop: 24,
  },
});

export default UserProfileScreen;
