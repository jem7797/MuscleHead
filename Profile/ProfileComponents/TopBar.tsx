import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * TopBar Component
 * Displays the top navigation bar with settings icon
 */
interface TopBarProps {
  onSettingsPress: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSettingsPress }) => {
  return (
    <View style={styles.topBar}>
      <View style={{ width: 34 }} />
      <TouchableOpacity
        style={styles.topIconButton}
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={20} color="#0f1724" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default TopBar;

