import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NavBar from "../Components/NavBar";
import PageHeader from "../Components/PageHeader";

interface Nemesis {
  id: string;
  username: string;
  notificationsEnabled: boolean;
}

const LeaderboardScreen = () => {
  const [nemeses, setNemeses] = useState<Nemesis[]>([
    { id: "1", username: "BeastMode99", notificationsEnabled: true },
    { id: "2", username: "IronWill", notificationsEnabled: false },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const MAX_NEMESES = 3;

  const handleToggleNotifications = (id: string) => {
    setNemeses((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, notificationsEnabled: !n.notificationsEnabled } : n
      )
    );
  };

  const handleRemoveNemesis = (id: string) => {
    setNemeses((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddNemesis = (username: string) => {
    if (nemeses.length < MAX_NEMESES && username.trim()) {
      const newNemesis: Nemesis = {
        id: Date.now().toString(),
        username: username.trim(),
        notificationsEnabled: true,
      };
      setNemeses((prev) => [...prev, newNemesis]);
      setSearchQuery("");
      setIsAdding(false);
    }
  };

  const canAddMore = nemeses.length < MAX_NEMESES;

  return (
    <View style={styles.container}>

        
      

      <ScrollView

        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.descriptionContainer} >
          <MaterialCommunityIcons name="sword-cross" size={32} color="#202c76" />
          <Text style={styles.descriptionTitle}>Track Your Rivals</Text>
          <Text style={styles.descriptionText}>
            Choose up to {MAX_NEMESES} users as your nemeses. Get notified when they log workouts and track their progress to stay motivated.
          </Text>
        </View>

        {/* Current Nemeses */}
        <View style={styles.section} >
          <Text style={styles.sectionTitle}>
            Your Nemeses ({nemeses.length}/{MAX_NEMESES})
          </Text>

          {nemeses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#a2a2a2" />
              <Text style={styles.emptyStateText}>No nemeses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add users to track their progress
              </Text>
            </View>
          ) : (
            nemeses.map((nemesis) => (
              <View key={nemesis.id} style={styles.nemesisCard}>
                <View style={styles.nemesisLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {nemesis.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.nemesisInfo}>
                    <Text style={styles.nemesisUsername}>{nemesis.username}</Text>
                    <Text style={styles.nemesisStatus}>
                      {nemesis.notificationsEnabled
                        ? "Notifications ON"
                        : "Notifications OFF"}
                    </Text>
                  </View>
                </View>

                <View style={styles.nemesisActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleNotifications(nemesis.id)}
                  >
                    <Ionicons
                      name={
                        nemesis.notificationsEnabled
                          ? "notifications"
                          : "notifications-off"
                      }
                      size={22}
                      color={nemesis.notificationsEnabled ? "#202c76" : "#a2a2a2"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveNemesis(nemesis.id)}
                  >
                    <Ionicons name="close-circle" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Nemesis Section */}
        {canAddMore && (
          <View style={styles.section}>
            {!isAdding ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAdding(true)}
              >
                <Ionicons name="add-circle" size={24} color="#202c76" />
                <Text style={styles.addButtonText}>Add Nemesis</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addNemesisCard}>
                <Text style={styles.addNemesisTitle}>Add New Nemesis</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter username..."
                  placeholderTextColor="#a2a2a2"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <View style={styles.addNemesisActions}>
                  <TouchableOpacity
                    style={[styles.addNemesisButton, styles.cancelButton]}
                    onPress={() => {
                      setIsAdding(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addNemesisButton,
                      styles.confirmButton,
                      !searchQuery.trim() && styles.confirmButtonDisabled,
                    ]}
                    onPress={() => handleAddNemesis(searchQuery)}
                    disabled={!searchQuery.trim()}
                  >
                    <Text style={styles.confirmButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Max Limit Reached */}
        {!canAddMore && (
          <View style={styles.limitReached}>
            <Ionicons name="information-circle" size={20} color="#202c76" />
            <Text style={styles.limitReachedText}>
              You've reached the maximum of {MAX_NEMESES} nemeses
            </Text>
          </View>
        )}

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  descriptionContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
    paddingTop: 60,

  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2a44",
    marginTop: 12,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#a2a2a2",
    textAlign: "center",
  },
  nemesisCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  nemesisLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#202c76",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  nemesisInfo: {
    flex: 1,
  },
  nemesisUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 4,
  },
  nemesisStatus: {
    fontSize: 12,
    color: "#666",
  },
  nemesisActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#202c76",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202c76",
    marginLeft: 8,
  },
  addNemesisCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  addNemesisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2a44",
    borderWidth: 1,
    borderColor: "#e0e6f0",
    marginBottom: 12,
  },
  addNemesisActions: {
    flexDirection: "row",
    gap: 12,
  },
  addNemesisButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    backgroundColor: "#202c76",
  },
  confirmButtonDisabled: {
    backgroundColor: "#a2a2a2",
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  limitReached: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  limitReachedText: {
    fontSize: 14,
    color: "#202c76",
    fontWeight: "500",
  },
});

export default LeaderboardScreen;
