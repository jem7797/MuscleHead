import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { LiveSessionExercise } from "../lib/sessionService";
import MuscleManFront from "./MuscleManFront";
import MuscleManBack from "./MuscleManBack";
import MuscleWomanFront from "./MuscleWomanFront";
import MuscleWomanBack from "./MuscleWomanBack";
import { WorkedMusclesProvider } from "../Contexts/WorkedMusclesContext";

interface SpectatorViewProps {
  exercises: LiveSessionExercise[];
  frontWorked: string[];
  backWorked: string[];
  isMale: boolean;
}

const SpectatorView: React.FC<SpectatorViewProps> = ({
  exercises,
  frontWorked,
  backWorked,
  isMale,
}) => {
  const MuscleFront = isMale ? MuscleManFront : MuscleWomanFront;
  const MuscleBack = isMale ? MuscleManBack : MuscleWomanBack;

  const [isBack, setIsBack] = useState(false);
  const spinVal = useRef(new Animated.Value(0)).current;

  const maxLift = useMemo(() => {
    let max = 0;
    exercises.forEach((item) => {
      if (item.weight != null && item.weight > max) {
        max = item.weight;
      }
    });
    return max;
  }, [exercises]);

  const spin = useMemo(
    () =>
      spinVal.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [spinVal],
  );

  const handleRotate = () => {
    Animated.sequence([
      Animated.timing(spinVal, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(spinVal, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    setIsBack((s) => !s);
  };

  return (
    <View style={styles.container}>
      <View style={styles.muscleSection}>
        <View style={styles.musclePreviewContainer}>
          <TouchableOpacity
            style={styles.musclePreviewTouchable}
            onPress={handleRotate}
            activeOpacity={0.9}
          >
            <View style={isBack ? styles.backViewWrapper : styles.frontViewWrapper}>
              <WorkedMusclesProvider frontWorked={frontWorked} backWorked={backWorked}>
                {isBack ? (
                  <MuscleBack width={170} height={300} />
                ) : (
                  <MuscleFront width={170} height={280} />
                )}
              </WorkedMusclesProvider>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="swap-horizontal" size={18} color="#202c76" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Logged Exercises</Text>
        {maxLift > 0 && (
          <View style={styles.maxLiftContainer}>
            <Text style={styles.maxLiftLabel}>Max Lift</Text>
            <Text style={styles.maxLiftValue}>{maxLift} lb</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises logged yet</Text>
          </View>
        ) : (
          (() => {
            const groups: { name: string; items: LiveSessionExercise[] }[] = [];
            let currentGroup: { name: string; items: LiveSessionExercise[] } | null = null;

            exercises.forEach((item) => {
              if (!currentGroup || currentGroup.name !== item.exercise_name) {
                currentGroup = { name: item.exercise_name, items: [item] };
                groups.push(currentGroup);
              } else {
                currentGroup.items.push(item);
              }
            });

            return groups.map((group, groupIndex) => (
              <View
                key={`${group.name}-${groupIndex}`}
                style={[
                  styles.exerciseGroup,
                  groupIndex > 0 && styles.exerciseGroupSpacing,
                ]}
              >
                <Text style={styles.exerciseGroupTitle}>{group.name}</Text>

                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderText, styles.tableColSet]}>Set</Text>
                  <Text style={[styles.tableHeaderText, styles.tableColReps]}>Reps</Text>
                  <Text style={[styles.tableHeaderText, styles.tableColWeight]}>Weight</Text>
                  <Text style={[styles.tableHeaderText, styles.tableColTime]}>Time</Text>
                </View>

                {group.items.map((item, index) => (
                  <View key={item.id} style={styles.exerciseRow}>
                    <View style={styles.tableDataRow}>
                      <Text style={[styles.exerciseDetail, styles.tableColSet]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.exerciseDetail, styles.tableColReps]}>
                        {item.reps}
                      </Text>
                      <Text style={[styles.exerciseDetail, styles.tableColWeight]}>
                        {item.weight != null ? `${item.weight} lb` : "—"}
                      </Text>
                      <Text style={[styles.exerciseMeta, styles.tableColTime]}>
                        {new Date(item.logged_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ));
          })()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  muscleSection: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 4,
    alignItems: "center",
  },
  musclePreviewContainer: {
    width: 210,
    height: 340,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dde3f0",
    overflow: "hidden",
    position: "relative",
  },
  musclePreviewTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  frontViewWrapper: { alignItems: "center", justifyContent: "center" },
  backViewWrapper: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scaleX: 0.9 }, { scaleY: 1.08 }],
  },
  rotateButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: "#202c76",
    zIndex: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "#e0e6f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
  maxLiftContainer: {
    alignItems: "flex-end",
  },
  maxLiftLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  maxLiftValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202c76",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9aa6bd",
  },
  exerciseGroup: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  exerciseGroupSpacing: {
    marginTop: 12,
  },
  exerciseGroupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 4,
  },
  exerciseRow: {
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f0",
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableColSet: {
    flex: 0.6,
  },
  tableColReps: {
    flex: 1,
  },
  tableColWeight: {
    flex: 1.2,
  },
  tableColTime: {
    flex: 1.4,
    textAlign: "right",
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
  exerciseMeta: {
    fontSize: 12,
    color: "#9aa6bd",
  },
  exerciseDetail: {
    fontSize: 14,
    color: "#5a6a7e",
  },
});

export default SpectatorView;

