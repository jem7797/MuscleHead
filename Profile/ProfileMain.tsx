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

const ProfileScreen = () => {
  const { username } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "progress">("posts");

  // User metric data (height, weight, natty status)
  const metricData = [
    { icon: "ruler", value: `5'8"` },
    { icon: "weight", value: "180 lb" },
    { icon: "syringe", value: "Natty" },
  ];

  // User statistics (following, posts, followers)
  const stats = [
    { label: "Following", value: "180" },
    { label: "Posts", value: "54" },
    { label: "Followers", value: "200" },
  ];

  const toggleSettings = () => setIsSettingsOpen((p) => !p);
  const toggleBio = () => setShowFullBio((p) => !p);

  return (
    <View style={styles.container}>
      <TopBar onSettingsPress={toggleSettings} />

      <ProfileHeader displayName={username || "User"} rank="Newbie" />

      <StatsRow stats={stats} />

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
