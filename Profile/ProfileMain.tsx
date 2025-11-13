import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import NavBar from "../Components/NavBar";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  const metricData = [
    { icon: "ruler", value: `6'2"` },
    { icon: "weight", value: "180 lb" },
    { icon: "syringe", value: "Natty" },
  ];

  const stats = [
    { label: "Following", value: "180" },
    { label: "Posts", value: "54" },
    { label: "Followers", value: "200" },
  ];

  const toggleSettings = () => setIsSettingsOpen((p) => !p);
  const toggleBio = () => setShowFullBio((p) => !p);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ width: 34 }} />
        <TouchableOpacity
          style={styles.topIconButton}
          onPress={toggleSettings}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color="#0f1724" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profilePicture}
          accessibilityRole="button"
          accessibilityLabel="Edit profile picture"
        >
          <Ionicons name="person" color="#fff" size={44} />
          <View style={styles.cameraPill}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.displayName}>Blaster7797</Text>
      </View>

      <View>
        <Text style = {styles.rankText}>
          Newbie
        </Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={toggleBio} activeOpacity={0.8}>
        <Text
          style={styles.bio}
          numberOfLines={showFullBio ? undefined : 2}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          faucibus ex sapien, vitae pellentesque sem placerat in. Id cursus mi
          pretium tellus. Duis convallis tempus leo eu, aenean sed diam
          consequat.
        </Text>
        <Text style={styles.seeMoreText}>
          {showFullBio ? "Show less" : "See more"}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
          <Text style={styles.actionText}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
          <Text style={styles.actionText}>Share profile</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent
        onRequestClose={toggleSettings}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Settings</Text>
              <Pressable
                onPress={toggleSettings}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
              >
                <Ionicons name="close" size={22} color="#1f2a44" />
              </Pressable>
            </View>

            <View style={styles.settingsList}>
              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="person-circle-outline" size={22} color="#1f2a44" />
                <Text style={styles.settingsText}>Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="notifications-outline" size={22} color="#1f2a44" />
                <Text style={styles.settingsText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="lock-closed-outline" size={22} color="#1f2a44" />
                <Text style={styles.settingsText}>Privacy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.highlightsContainer}>
        <View style={styles.progressBarContainer}>
        <View style={styles.progressBarSegmentGrey} />
        <View style={styles.progressBarDivider} />
          <View style={styles.progressBarSegmentGrey} />
          <View style={styles.progressBarDivider} />
          <View style={styles.progressBarSegmentGrey} />
        </View>
        <View style={styles.metricsRow}>
          {metricData.map((metric) => (
            <View key={metric.icon} style={styles.metricItem}>
              <View style={styles.metricBubble}>
                <FontAwesome5 name={metric.icon} size={16} color="#1f2a44" />
              </View>
              <Text style={styles.metricText}>{metric.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* spacer so content isn't obscured by bottom nav */}
      <View style={{ height: 24 }} />

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  // overall
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  // top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    paddingTop: 50,
  },
  topIconButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  // profile section
  profileSection: {
    marginTop: 0,
    alignItems: "center",
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#e6eef8",
    backgroundColor: "#708090",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cameraPill: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    backgroundColor: "#1f2a44",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "600",
    color: "#0f1724",
  },
  // stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f1724",
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#5a6a7e",
  },

  // bio
  bio: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#5a6a7e",
    maxWidth: 360,
  },
  seeMoreText: {
    marginTop: 6,
    color: "#1f2a44",
    fontWeight: "600",
    textAlign: "center",
  },

  // action buttons
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e6ed",
    backgroundColor: "#f6f8fa",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f1724",
  },
  // highlights
  highlightsContainer: {
    width: "90%",
    marginTop: 26,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    flexDirection: "row",
    backgroundColor: "#e5e9f3",
    borderRadius: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressBarSegment: {
    flex: 1,
    backgroundColor: "#202c76",
    height: "100%",
  },
  progressBarSegmentGrey: {
    flex: 1,
    backgroundColor: "#b4b4b4",
    height: "100%",
  },
  progressBarDivider: {
    width: 2,
    backgroundColor: "#fff",
    height: "100%",
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
    justifyContent: "center",
    // bubble shadow
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  metricText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: "#1f2a44",
  },

  // modal styles (kept mostly as you had them)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2a44",
  },
  closeButton: {
    padding: 6,
  },
  settingsList: {
    width: "100%",
    marginTop: 6,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f5f7fb",
    marginBottom: 12,
  },
  settingsText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#1f2a44",
    fontWeight: "500",
  },

  rankText:{
    color: "darkgrey"
  }
});

export default ProfileScreen;
