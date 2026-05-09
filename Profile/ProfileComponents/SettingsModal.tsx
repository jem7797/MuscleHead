import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import {
  accent,
  borderSubtle,
  sheetHandle,
  surfaceElevated,
  surfaceMuted,
  textPrimary,
} from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "../../Contexts/UserContext";
import { CommonActions, useNavigation } from "@react-navigation/native";

/**
 * SettingsModal Component
 * Displays the user settings modal with account, notifications, and privacy options
 */
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
  onAccoladesPress?: () => void;
  onFollowRequestsPress?: () => void;
  onRequestDeleteAccount?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onEditProfile,
  onAccoladesPress,
  onFollowRequestsPress,
  onRequestDeleteAccount,
}) => {
  const navigation = useNavigation<any>();

  const { logOut } = useUser();

  const handleLogOut = async () => {
    onClose();
    await logOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      }),
    );
  };

 
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.sheetHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Settings</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
            >
              <Ionicons name="close" size={22} color={accent} />
            </Pressable>
          </View>

          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                onClose();
                onEditProfile?.();
              }}
            >
              <Ionicons name="create-outline" size={22} color={accent} />
              <Text style={styles.settingsText}>Edit profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                onClose();
                onAccoladesPress?.();
              }}
            >
              <Ionicons name="ribbon-sharp" size={22} color={accent} />
              <Text style={styles.settingsText}>Accolades</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                onClose();
                onFollowRequestsPress?.();
              }}
            >
              <Ionicons name="person-add-outline" size={22} color={accent} />
              <Text style={styles.settingsText}>Follow Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => handleLogOut()}
            >
              <MaterialIcons name="logout" size={22} color="red" />
              <Text style={styles.settingsText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                onClose();
                onRequestDeleteAccount?.();
              }}
            >
              <MaterialIcons name="dangerous" size={22} color="red" />
              <Text style={styles.settingsText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: surfaceElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: borderSubtle,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sheetHandle,
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: accent,
  },
  closeButton: {
    padding: 6,
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  settingsList: {
    width: "100%",
    marginTop: 6,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
    marginBottom: 10,
  },
  settingsText: {
    marginLeft: 12,
    fontSize: 15,
    color: textPrimary,
    fontWeight: "600",
  },
});

export default SettingsModal;
