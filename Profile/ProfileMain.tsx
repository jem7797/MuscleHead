import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../Components/NavBar";
import TopBar from "./ProfileComponents/TopBar";
import ProfileHeader from "./ProfileComponents/ProfileHeader";
import StatsRow from "./ProfileComponents/StatsRow";
import BioSection from "./ProfileComponents/BioSection";
import ActionButtons from "./ProfileComponents/ActionButtons";
import SettingsModal from "./ProfileComponents/SettingsModal";
import ProgressBar from "./ProfileComponents/ProgressBar";
import MetricsRow from "./ProfileComponents/MetricsRow";
import ContentSection from "./ProfileComponents/ContentSection";
import { useUser } from "../Contexts/UserContext";

const formatHeight = (totalInches?: number | null) => {
  if (totalInches === undefined || totalInches === null) {
    return `0'0"`;
  }
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

const ProfileScreen = () => {
  const navigation = useNavigation<any>();

  const {
    bio,
    xp,
    numberFollowing,
    numberOfFollowers,
    numberOfPosts,
    weight,
    height,
    isNatty,
    userId,
    nemesisSubIds,
    deleteCurrentUser,
  } = useUser();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User metric data (height, weight, natty status) — N/A when null/undefined
  const metricData = [
    {
      icon: "ruler",
      value: height != null ? formatHeight(height) : "N/A",
    },
    {
      icon: "weight",
      value: weight != null ? `${weight} lb` : "N/A",
    },
    {
      icon: "syringe",
      value: isNatty ? "Natty" : "Not Natty",
    },
  ];

  // User statistics (following, posts, followers)
  const stats = [
    { label: "Following", value: String(numberFollowing ?? 0) },
    { label: "Posts", value: String(numberOfPosts ?? 0) },
    { label: "Followers", value: String(numberOfFollowers ?? 0) },
  ];

  const toggleSettings = () => setIsSettingsOpen((p) => !p);

  const handleDeleteAccountRequest = () => {
    setIsSettingsOpen(false);

    setTimeout(() => {
      Alert.alert(
        "Are you sure you want to delete your account?",
        "This action will permanently will delete your account and all data associated with it",
        [
          {text: "Cancel", style: "cancel"},
          {
            text:"Delete",
            style: "destructive",
          onPress: async() =>{
            try {
              await deleteCurrentUser();
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } catch (error) {
              Alert.alert("Unable to delete account", "Please try again.");
            }
          }
          }
        ]
      );
    });
  };

  return (
    <View style={styles.container}>
      <TopBar onSettingsPress={toggleSettings} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <StatsRow
          stats={stats}
          onFollowingPress={() =>
            userId &&
            navigation.navigate("FollowList", {
              subId: userId,
              mode: "following",
              displayName: "Your",
            })
          }
          onFollowersPress={() =>
            userId &&
            navigation.navigate("FollowList", {
              subId: userId,
              mode: "followers",
              displayName: "Your",
            })
          }
        />

        <BioSection bio={bio || "Add a bio in your profile settings."} />

        <ActionButtons />

        <View style={styles.highlightsContainer}>
          <ProgressBar />
          <MetricsRow metrics={metricData} />
        </View>

        <ContentSection
          subId={userId}
          currentUserId={userId}
          nemesisSubIds={nemesisSubIds}
        />

        {/* spacer so content isn't obscured by bottom nav */}
        <View style={{ height: 24 }} />
      </ScrollView>

      <SettingsModal
        visible={isSettingsOpen}
        onClose={toggleSettings}
        onEditProfile={() => navigation.navigate("ProfileEdit")}
        onAccoladesPress={() => navigation.navigate("Accolades")}
        onFollowRequestsPress={() => navigation.navigate("FollowRequests")}
        onRequestDeleteAccount={handleDeleteAccountRequest}
      />

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 8,
  },
  highlightsContainer: {
    width: "90%",
    marginTop: 26,
  },
});

export default ProfileScreen;
