import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RoutineCard, { RoutineTemplate } from "./RoutineCard";

interface RoutineCardsSectionProps {
  routines: RoutineTemplate[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalElements?: number;
  onRoutinePress: (routine: RoutineTemplate) => void;
  onLoadMore?: () => void;
}

const RoutineCardsSection: React.FC<RoutineCardsSectionProps> = ({
  routines,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  totalElements = 0,
  onRoutinePress,
  onLoadMore,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Routines</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#202c76" />
          <Text style={styles.loadingText}>Loading routines...</Text>
        </View>
      </View>
    );
  }

  if (routines.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Routines</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No routines yet</Text>
          <Text style={styles.emptySubtext}>Add a workout template to get started</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Your Routines</Text>
        <Text style={styles.countText}>
          {totalElements > 0 ? `${routines.length} of ${totalElements}` : `${routines.length} routine${routines.length === 1 ? "" : "s"}`}
        </Text>
      </View>
      <ScrollView
        horizontal
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        {routines.map((routine) => (
          <RoutineCard
            key={routine.id ?? routine.name}
            routine={routine}
            onPress={() => onRoutinePress(routine)}
          />
        ))}
        {hasMore && (
          <TouchableOpacity
            style={styles.loadMoreCard}
            onPress={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color="#202c76" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={28} color="#51607a" />
                <Text style={styles.loadMoreText}>Load more</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
  countText: {
    fontSize: 13,
    color: "#8a9bb5",
  },
  loadMoreCard: {
    width: 100,
    minHeight: 80,
    backgroundColor: "#f4f6fa",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  loadMoreText: {
    fontSize: 13,
    color: "#51607a",
    marginTop: 6,
  },
  scrollView: {
    marginHorizontal: -16,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#51607a",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#51607a",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#8a9bb5",
  },
});

export default RoutineCardsSection;
