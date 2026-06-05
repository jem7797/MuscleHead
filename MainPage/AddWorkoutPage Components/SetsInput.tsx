import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { PreviousAttemptSet } from "../../Services/sessionInstanceApi";
import {
  getRepsComparison,
  getWeightComparison,
  type ComparisonDirection,
} from "../../utils/setComparison";
import {
  accent,
  borderSubtle,
  screenBackground,
  surfaceMuted,
  textPrimary,
  textSecondary,
} from "../../theme/colors";

export type SetType = "normal" | "warmup";

export interface WorkoutSetInput {
  reps: string;
  weight: string;
  completed?: boolean;
  setType?: SetType;
}

interface SetsInputProps {
  workoutName: string;
  sets: WorkoutSetInput[];
  previousSets?: PreviousAttemptSet[] | null;
  hideTitle?: boolean;
  showAddSet?: boolean;
  showRemoveSet?: boolean;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (
    index: number,
    field: "reps" | "weight" | "completed" | "setType",
    value: string | boolean,
  ) => void;
}

const COMPARISON_UP_COLOR = "#22c55e";
const COMPARISON_DOWN_COLOR = "#ef4444";

const ComparisonArrow = ({
  direction,
}: {
  direction: ComparisonDirection;
}) => (
  <Ionicons
    name={direction === "up" ? "arrow-up" : "arrow-down"}
    size={14}
    color={direction === "up" ? COMPARISON_UP_COLOR : COMPARISON_DOWN_COLOR}
    style={styles.comparisonArrow}
  />
);

const SetsInput: React.FC<SetsInputProps> = ({
  workoutName,
  sets,
  previousSets,
  hideTitle = false,
  showAddSet = true,
  showRemoveSet = true,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}) => {
  return (
    <View style={styles.section}>
      {!hideTitle && (
        <Text style={styles.sectionTitle}>{workoutName}</Text>
      )}

      <View style={styles.setsContainer}>
        <View style={styles.setsHeaderRow}>
          <Text style={styles.setHeaderLabel}>Set</Text>
          <Text style={styles.setHeaderType}>Type</Text>
          <Text style={styles.setHeaderInput}>Weight (lbs)</Text>
          <Text style={[styles.setHeaderInput, styles.repsHeaderInput]}>Reps</Text>
          <View style={styles.checkHeader} />
        </View>

        {sets.map((set, index) => {
          const previous = previousSets?.[index];
          const setType = set.setType ?? "normal";
          const repsArrow = getRepsComparison(set.reps, previous, previousSets);
          const weightArrow = getWeightComparison(
            set.weight,
            previous,
            previousSets,
          );

          return (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setLabel}>
                {setType === "warmup" ? "W" : index + 1}
              </Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typePill,
                    setType === "normal" && styles.typePillActive,
                  ]}
                  onPress={() => onUpdateSet(index, "setType", "normal")}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      setType === "normal" && styles.typePillTextActive,
                    ]}
                  >
                    Work
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typePill,
                    setType === "warmup" && styles.typePillActive,
                  ]}
                  onPress={() => onUpdateSet(index, "setType", "warmup")}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      setType === "warmup" && styles.typePillTextActive,
                    ]}
                  >
                    Warm
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWithArrow}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight (lbs)"
                  placeholderTextColor={textSecondary}
                  value={set.weight}
                  onChangeText={(text) => onUpdateSet(index, "weight", text)}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit
                />
                {weightArrow ? (
                  <ComparisonArrow direction={weightArrow} />
                ) : null}
              </View>
              <View style={styles.inputWithArrow}>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  placeholderTextColor={textSecondary}
                  value={set.reps}
                  onChangeText={(text) => onUpdateSet(index, "reps", text)}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit
                />
                {repsArrow ? <ComparisonArrow direction={repsArrow} /> : null}
              </View>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() =>
                  onUpdateSet(index, "completed", !(set.completed ?? false))
                }
              >
                <Ionicons
                  name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={set.completed ? "#22c55e" : textSecondary}
                />
              </TouchableOpacity>
              {showRemoveSet && sets.length > 1 && (
                <TouchableOpacity
                  onPress={() => onRemoveSet(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={18} color={textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {showAddSet && (
          <TouchableOpacity onPress={onAddSet} style={styles.addSetButtonBottom}>
            <Ionicons name="add" size={18} color={accent} />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: textPrimary,
    marginBottom: 10,
  },
  setsContainer: {
    backgroundColor: screenBackground,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: borderSubtle,
  },
  setsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: borderSubtle,
  },
  setHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: textSecondary,
    width: 28,
    textAlign: "center",
  },
  setHeaderType: {
    fontSize: 12,
    fontWeight: "600",
    color: textSecondary,
    width: 56,
    textAlign: "center",
  },
  setHeaderInput: {
    fontSize: 12,
    fontWeight: "600",
    color: textSecondary,
    flex: 1,
    textAlign: "center",
     marginLeft: -19,
  },
  repsHeaderInput: {
    marginLeft: -65,
  },
  checkHeader: {
    width: 32,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: textSecondary,
    width: 28,
    textAlign: "center",
  },
  typeToggle: {
    width: 56,
    marginHorizontal: 2,
    gap: 2,
  },
  typePill: {
    backgroundColor: surfaceMuted,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: borderSubtle,
    alignItems: "center",
  },
  typePillActive: {
    backgroundColor: accent,
    borderColor: accent,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: "600",
    color: textSecondary,
  },
  typePillTextActive: {
    color: "#fff",
  },
  inputWithArrow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    backgroundColor: surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 15,
    color: textPrimary,
    borderWidth: 1,
    borderColor: borderSubtle,
    textAlign: "center",
  },
  comparisonArrow: {
    width: 16,
    marginLeft: 2,
  },
  checkButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  addSetButtonBottom: {
    backgroundColor: surfaceMuted,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: borderSubtle,
    marginTop: 4,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: "500",
    color: accent,
    marginLeft: 4,
  },
});

export default SetsInput;
