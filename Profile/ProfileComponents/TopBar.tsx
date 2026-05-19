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
  onCreatePostPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSettingsPress, onCreatePostPress }) => {
  return (
    <View style={styles.topBar}>
      {onCreatePostPress ? (
        <TouchableOpacity
          style={styles.topIconButton}
          onPress={onCreatePostPress}
          accessibilityRole="button"
          accessibilityLabel="Create post"
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#e85d04" />
        </TouchableOpacity>
      ) : (
        <View style={styles.topIconSpacer} />
      )}
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
  topIconSpacer: {
    width: 34,
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

