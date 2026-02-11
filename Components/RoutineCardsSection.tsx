import React from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import RoutineCard, { RoutineTemplate } from "./RoutineCard";

interface RoutineCardsSectionProps {
  routines: RoutineTemplate[];
  isLoading: boolean;
  onRoutinePress: (routine: RoutineTemplate) => void;
}

const RoutineCardsSection: React.FC<RoutineCardsSectionProps> = ({
  routines,
  isLoading,
  onRoutinePress,
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
      <Text style={styles.sectionTitle}>Your Routines</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 12,
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
