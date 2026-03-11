import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import NavBar from "../Components/NavBar";
import { Ionicons } from "@expo/vector-icons";
import { getProfilePicUrl } from "../utils/profilePicUrl";
import { Image } from "expo-image";
import {
  getFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
  type FollowRequestResponse,
} from "../Services/followApi";

const FollowRequestsScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<FollowRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFollowRequests();
      setRequests(data ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleAccept = async (req: FollowRequestResponse) => {
    if (actionId) return;
    setActionId(req.id);
    try {
      await acceptFollowRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      // Keep in list on error
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (req: FollowRequestResponse) => {
    if (actionId) return;
    setActionId(req.id);
    try {
      await declineFollowRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      // Keep in list on error
    } finally {
      setActionId(null);
    }
  };

  const handleUserPress = (req: FollowRequestResponse) => {
    const subId = req.requester?.sub_id ?? req.requester?.subId;
    if (subId) navigation.navigate("UserProfile", { subId });
  };

  const renderItem = ({ item }: { item: FollowRequestResponse }) => {
    const requester = item.requester ?? {};
    const subId = requester.sub_id ?? requester.subId;
    const displayName = requester.username ?? requester.first_name ?? "User";
    const pfpUrl = getProfilePicUrl(requester);
    const isProcessing = actionId === item.id;

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
                {displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.username}>{displayName}</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.declineBtn, isProcessing && styles.btnDisabled]}
            onPress={() => handleDecline(item)}
            disabled={isProcessing}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, isProcessing && styles.btnDisabled]}
            onPress={() => handleAccept(item)}
            disabled={isProcessing}
          >
            <Text style={styles.acceptBtnText}>
              {isProcessing ? "..." : "Accept"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.headerTitle}>Follow Requests</Text>
        <ActivityIndicator size="large" color="#1f2a44" style={styles.loader} />
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.headerTitle}>Follow Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="person-add-outline" size={48} color="#a2a2a2" />
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2a44",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#e8ecf4",
    borderRadius: 8,
  },
  acceptBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#202c76",
    borderRadius: 8,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5a6a7e",
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#5a6a7e",
  },
});

export default FollowRequestsScreen;
