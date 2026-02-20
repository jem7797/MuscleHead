import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * SettingsModal Component
 * Displays the user settings modal with account, notifications, and privacy options
 */
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onEditProfile }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Settings</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
            >
              <Ionicons name="close" size={22} color="#1f2a44" />
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
              <Ionicons name="create-outline" size={22} color="#1f2a44" />
              <Text style={styles.settingsText}>Edit profile</Text>
            </TouchableOpacity>

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
  );
};

const styles = StyleSheet.create({
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
});

export default SettingsModal;

