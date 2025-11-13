import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * TabSwitcher Component
 * Displays tab icons for switching between Posts and Progress Pictures views
 * Shows an underline indicator for the active tab
 */
interface TabSwitcherProps {
  activeTab: "posts" | "progress";
  onTabChange: (tab: "posts" | "progress") => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange("posts")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="grid-outline"
          size={24}
          color={activeTab === "posts" ? "#1f2a44" : "#9ca3af"}
        />
        {activeTab === "posts" && <View style={styles.tabUnderline} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange("progress")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="images-outline"
          size={24}
          color={activeTab === "progress" ? "#1f2a44" : "#9ca3af"}
        />
        {activeTab === "progress" && <View style={styles.tabUnderline} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 40,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 8,
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#202c76",
    borderRadius: 1,
  },
});

export default TabSwitcher;

