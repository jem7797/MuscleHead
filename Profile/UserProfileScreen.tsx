import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import BackButton from "../Components/BackButton";
import StatsRow from "./ProfileComponents/StatsRow";
import BioSection from "./ProfileComponents/BioSection";
import MetricsRow from "./ProfileComponents/MetricsRow";
import { getUser } from "../Services/userApi";

const formatHeight = (totalInches?: number | null) => {
  if (totalInches === undefined || totalInches === null) return "N/A";
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

const getPfpUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  return raw.startsWith("http") ? raw : `https://${raw}`;
};

const UserProfileScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const subId = route.params?.subId ?? route.params?.sub_id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subId) {
      setError("No user specified");
      setLoading(false);
      return;
    }
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
    return () => { cancelled = true; };
  }, [subId]);

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
  const pfpUrl = getPfpUrl(user.profile_pic_url ?? user.profilePicUrl ?? user.pfp_link);
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
        <View style={{ width: 40 }} />
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
        </View>
        <StatsRow stats={stats} />
        <BioSection bio={bio} />
        <View style={styles.metricsSection}>
          <MetricsRow metrics={metrics} />
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
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
