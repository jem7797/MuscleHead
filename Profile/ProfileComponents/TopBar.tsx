import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { borderSubtle, surfaceMuted, textPrimary } from "../../theme/colors";

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
        <Ionicons name="settings-outline" size={20} color={textPrimary} />
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
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
});

export default TopBar;

