import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../Components/BackButton";
import NavBar from "../Components/NavBar";
import { getMutualFriends } from "../Services/followApi";
import { createLiveSession, sendInvite } from "../lib/sessionService";
import { useUser } from "../Contexts/UserContext";
import { getProfilePicUrl } from "../utils/profilePicUrl";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export interface FriendUser {
  sub_id?: string;
  subId?: string;
  username?: string;
  first_name?: string;
  profile_pic_url?: string;
  profilePicUrl?: string;
  pfp_link?: string;
  [key: string]: unknown;
}

const FriendsListScreen = () => {
  const navigation = useNavigation<any>();
  const { userId: currentUserId } = useUser();
  const [users, setUsers] = useState<FriendUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const name = (u.username ?? u.first_name ?? "").toLowerCase();
    return name.includes(searchQuery.trim().toLowerCase());
  });

  useEffect(() => {
    if (!currentUserId) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    let cancelled = false;
    getMutualFriends(currentUserId)
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load friends");
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentUserId]);

  const handleUserPress = (user: FriendUser) => {
    const id = user.sub_id ?? user.subId;
    if (id) navigation.navigate("UserProfile", { subId: id });
  };

  const handleInviteToSession = async (user: FriendUser) => {
    const subId = user.sub_id ?? user.subId;
    if (!subId || !currentUserId || invitingId) return;
    setInvitingId(subId);
    try {
      const session = await createLiveSession();
      await sendInvite({ sessionId: session.id, toUserId: subId });
      navigation.navigate("MultiplayerWaitingScreen", {
        sessionId: session.id,
        currentUserId,
        hostUserId: currentUserId,
        guestUserId: null,
      });
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not send invite."
      );
    } finally {
      setInvitingId(null);
    }
  };

  const renderUser = ({ item }: { item: FriendUser }) => {
    const userSubId = item.sub_id ?? item.subId;
    const displayName = item.username ?? item.first_name ?? "User";
    const pfpUrl = getProfilePicUrl(item);
    const isCurrentUser = currentUserId && userSubId === currentUserId;

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
        {!isCurrentUser && userSubId && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInviteToSession(item)}
            disabled={!!invitingId}
          >
            {invitingId === userSubId ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.inviteButtonText}>Invite to Session</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.headerTitle}>Friends</Text>
        <ActivityIndicator size="large" color="#1f2a44" style={styles.loader} />
        <NavBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <BackButton />
        <Text style={styles.headerTitle}>Friends</Text>
        <Text style={styles.errorText}>{error}</Text>
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>
          Friends
        </Text>
        <View style={{ width: 40 }} />
      </View>
      {users.length > 0 && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9aa6bd" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#9aa6bd"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            blurOnSubmit
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#9aa6bd" />
            </TouchableOpacity>
          )}
        </View>
      )}
      {users.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color="#a2a2a2" />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Follow users and get followed back to see them here
          </Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color="#a2a2a2" />
          <Text style={styles.emptyText}>No friends match "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, i) => (item.sub_id ?? item.subId ?? `u-${i}`) as string}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
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
    paddingBottom: 12,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f5f7fb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2a44",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5a6a7e",
    textAlign: "center",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    backgroundColor: "#e0e6f0",
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
    color: "#5a6a7e",
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2a44",
    marginLeft: 12,
  },
  inviteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#1f2a44",
    minWidth: 120,
    alignItems: "center",
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#5a6a7e",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#9aa6bd",
    textAlign: "center",
  },
});

export default FriendsListScreen;
