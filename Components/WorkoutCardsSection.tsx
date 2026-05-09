import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import WorkoutCard, { WorkoutSession } from "./WorkoutCard";
import { textSecondary } from "../theme/colors";

interface WorkoutCardsSectionProps {
  workouts: WorkoutSession[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalElements?: number;
  onWorkoutPress: (workout: WorkoutSession) => void;
  onLoadMore?: () => void;
}

const WorkoutCardsSection: React.FC<WorkoutCardsSectionProps> = ({
  workouts,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  totalElements = 0,
  onWorkoutPress,
  onLoadMore,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Workouts</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#e85d04" />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Workouts</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>
            Complete a workout to see it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Your Workouts</Text>
        {totalElements > 0 && (
          <Text style={styles.countText}>
            {workouts.length} of {totalElements}
          </Text>
        )}
      </View>
      <ScrollView
        horizontal
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id ?? workout.name}
            workout={workout}
            onPress={() => onWorkoutPress(workout)}
          />
        ))}
        {hasMore && (
          <TouchableOpacity
            style={styles.loadMoreCard}
            onPress={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color="#e85d04" />
            ) : (
              <Text style={styles.loadMoreCardText}>
                Load more
              </Text>
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
    color: "#e85d04",
  },
  countText: {
    fontSize: 13,
    color: "#8a9bb5",
  },
  loadMoreCard: {
    width: 160,
    backgroundColor: "#e85d04",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreCardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
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
    color: textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#8a9bb5",
  },
});

export default WorkoutCardsSection;
