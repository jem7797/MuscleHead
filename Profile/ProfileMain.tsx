import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import NavBar from "../Components/NavBar";
import TopBar from "./ProfileComponents/TopBar";
import ProfileHeader from "./ProfileComponents/ProfileHeader";
import StatsRow from "./ProfileComponents/StatsRow";
import BioSection from "./ProfileComponents/BioSection";
import ActionButtons from "./ProfileComponents/ActionButtons";
import SettingsModal from "./ProfileComponents/SettingsModal";
import ProgressBar from "./ProfileComponents/ProgressBar";
import MetricsRow from "./ProfileComponents/MetricsRow";
import TabSwitcher from "./ProfileComponents/TabSwitcher";
import ContentSection from "./ProfileComponents/ContentSection";
import { useUser } from "../Contexts/UserContext";

/**
 * ProfileScreen Component
 * Main profile page that displays user information, stats, and content tabs
 * Composed of multiple smaller components for better organization and maintainability
 */

const formatHeight = (totalInches?: number | null) => {
  if (totalInches === undefined || totalInches === null) {
    return `0'0"`;
  }
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

const ProfileScreen = () => {
  const {
    xp,
    numberFollowing,
    numberOfFollowers,
    numberOfPosts,
    weight,
    height,
    isNatty,
  } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "progress">("posts");
  

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
      value:
         isNatty ? "Natty": "Not Natty",
    },
  ];

  // User statistics (following, posts, followers)
  const stats = [
    { label: "Following", value: String(numberFollowing ?? 0) },
    { label: "Posts", value: String(numberOfPosts ?? 0) },
    { label: "Followers", value: String(numberOfFollowers ?? 0) },
  ];

  const toggleSettings = () => setIsSettingsOpen((p) => !p);
  const toggleBio = () => setShowFullBio((p) => !p);

  return (
    <View style={styles.container}>
      <TopBar onSettingsPress={toggleSettings} />

      <ProfileHeader />

      <StatsRow stats={stats}/>

      <BioSection
        bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus ex sapien, vitae pellentesque sem placerat in. Id cursus mi pretium tellus. Duis convallis tempus leo eu, aenean sed diam consequat."
        showFullBio={showFullBio}
        onToggleBio={toggleBio}
      />

      <ActionButtons />

      <SettingsModal visible={isSettingsOpen} onClose={toggleSettings} />

      <View style={styles.highlightsContainer}>
        <ProgressBar />
        <MetricsRow metrics={metricData} />
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <ContentSection activeTab={activeTab} />

      {/* spacer so content isn't obscured by bottom nav */}
      <View style={{ height: 24 }} />

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
  highlightsContainer: {
    width: "90%",
    marginTop: 26,
  },
});

export default ProfileScreen;
