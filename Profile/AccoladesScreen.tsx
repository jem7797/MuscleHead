import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { borderSubtle, screenBackground, surfaceMuted } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import NavBar from "../Components/NavBar";
import { getAllMedals, type Medal } from "../Services/medalsApi";
import { createAchievementPost } from "../Services/postsApi";

const TROPHY_COLOR_EARNED = "#ffd700";
const TROPHY_COLOR_LOCKED = "#4a4a4a";
const GRID_COLUMNS = 4;
const TROPHY_SIZE = 64;

function formatEarnedDate(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const AccoladesScreen = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);
  const [posting, setPosting] = useState(false);
  const { width } = useWindowDimensions();

  const handleShareAchievement = async () => {
    if (!selectedMedal?.earned || posting) return;
    const achievementId = selectedMedal.achievementId ?? selectedMedal.id;
    if (achievementId == null) {
      Alert.alert("Cannot share", "Achievement ID is missing. Please try again later.");
      return;
    }
    setPosting(true);
    try {
      await createAchievementPost(achievementId);
      setSelectedMedal(null);
      Alert.alert("Shared!", "Your achievement has been posted to the feed.");
    } catch (e) {
      Alert.alert("Could not share", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setPosting(false);
    }
  };
  const itemWidth = (width - 48 - (GRID_COLUMNS - 1) * 12) / GRID_COLUMNS;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        try {
          const data = await getAllMedals();
          if (!cancelled) setMedals(data);
        } catch {
          if (!cancelled) setMedals([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const renderItem = ({ item, index }: { item: Medal; index: number }) => {
    const isLastInRow = (index + 1) % GRID_COLUMNS === 0;
    return (
      <TouchableOpacity
        style={[
          styles.trophyCell,
          { width: itemWidth, height: itemWidth },
          !isLastInRow && styles.cellMarginRight,
        ]}
        onPress={() => setSelectedMedal(item)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="trophy"
          size={TROPHY_SIZE}
          color={item.earned ? TROPHY_COLOR_EARNED : TROPHY_COLOR_LOCKED}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Accolades" />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e85d04" />
        </View>
      ) : (
        <FlatList
          data={medals}
          keyExtractor={(item) => item.medalName}
          renderItem={renderItem}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <NavBar />

      <Modal
        visible={!!selectedMedal}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedMedal(null)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedMedal && (
              <>
                <View style={styles.modalIconRow}>
                  <Ionicons
                    name="trophy"
                    size={48}
                    color={selectedMedal.earned ? TROPHY_COLOR_EARNED : TROPHY_COLOR_LOCKED}
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {selectedMedal.medalName.replace(/_/g, " ")}
                </Text>
                <Text style={styles.modalMessage}>{selectedMedal.description}</Text>
                {selectedMedal.earned && selectedMedal.awardedAt && (
                  <Text style={styles.modalDateEarned}>
                    Earned {formatEarnedDate(selectedMedal.awardedAt)}
                  </Text>
                )}
                {selectedMedal.earned && (selectedMedal.achievementId != null || selectedMedal.id != null) && (
                  <TouchableOpacity
                    style={[styles.shareButton, posting && styles.shareButtonDisabled]}
                    onPress={handleShareAchievement}
                    disabled={posting}
                  >
                    <Ionicons name="share-social-outline" size={18} color="#fff" />
                    <Text style={styles.shareButtonText}>{posting ? "Posting..." : "Share to Feed"}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.dismissButton, selectedMedal.earned && styles.dismissButtonSecondary]}
                  onPress={() => setSelectedMedal(null)}
                >
                  <Text style={[styles.dismissButtonText, selectedMedal.earned && styles.dismissButtonTextSecondary]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  row: {
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  cellMarginRight: {
    marginRight: 12,
  },
  trophyCell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: screenBackground,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalIconRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e85d04",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  modalMessage: {
    fontSize: 15,
    color: "#5a6a7e",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  modalDateEarned: {
    fontSize: 13,
    color: "#8a9bb5",
    textAlign: "center",
    marginBottom: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dismissButton: {
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  dismissButtonSecondary: {
    backgroundColor: surfaceMuted,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dismissButtonTextSecondary: {
    color: "#e85d04",
  },
});

export default AccoladesScreen;
