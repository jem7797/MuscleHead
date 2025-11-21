import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

interface MuscleGroupSelectorProps {
  muscleGroups: string[];
  selectedGroup: string | null;
  onSelect: (group: string) => void;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  muscleGroups,
  selectedGroup,
  onSelect,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Muscle Group</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {muscleGroups.map((group) => (
          <TouchableOpacity
            key={group}
            style={[
              styles.selectorButton,
              selectedGroup === group && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(group)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                selectedGroup === group && styles.selectorButtonTextActive,
              ]}
            >
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 8,
  },
  selectorScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  selectorButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "white",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  selectorButtonActive: {
    backgroundColor: "#202c76",
    borderColor: "#202c76",
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
});

export default MuscleGroupSelector;

