import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { screenBackground } from "../theme/colors";
import { useRoute } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import { getSessionLogById, type SessionLogApiResponse } from "../Services/sessionLogApi";
import {
  getSessionExercisesBySessionId,
  type SessionExerciseResponse,
} from "../Services/sessionInstanceApi";
import { useMovements } from "../Contexts/MovementContext";

const WorkoutDetailPage = () => {
  const route = useRoute<any>();
  const sessionId = route.params?.sessionId as number | undefined;
  const { movements } = useMovements();

  const movementById = useMemo(() => {
    const map: Record<number, string> = {};
    movements.forEach((m) => {
      map[m.id] = m.name;
    });
    return map;
  }, [movements]);

  const [session, setSession] = useState<SessionLogApiResponse | null>(null);
  const [exercises, setExercises] = useState<SessionExerciseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId == null) return;
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [sessionData, exercisesData] = await Promise.all([
          getSessionLogById(sessionId),
          getSessionExercisesBySessionId(sessionId),
        ]);
        if (!cancelled) {
          setSession(sessionData);
          setExercises(exercisesData);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load workout");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (sessionId == null) {
    return (
      <View style={styles.container}>
        <PageHeader title="Workout" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Invalid workout</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Workout" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#e85d04" />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.container}>
        <PageHeader title="Workout" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error ?? "Workout not found"}</Text>
        </View>
      </View>
    );
  }

  const dateStr = new Date(session.date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const totalWeight = session.total_weight_lifted ?? 0;
  const timeMins = session.timeSpentInGym ?? 0;

  return (
    <View style={styles.container}>
      <PageHeader title={dateStr} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          {totalWeight > 0 && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(totalWeight).toLocaleString()}</Text>
              <Text style={styles.statLabel}>lbs lifted</Text>
            </View>
          )}
          {timeMins > 0 && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{timeMins}</Text>
              <Text style={styles.statLabel}>min</Text>
            </View>
          )}
        </View>

        {session.notes && session.notes.trim() ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.exercisesTitle}>Exercises</Text>
        {exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercise data recorded</Text>
        ) : (
          exercises.map((ex, index) => {
            const exerciseId = ex.exerciseId ?? ex.exercise_id ?? ex.movement_id ?? ex.movement?.id;
            const exerciseName =
              ex.exerciseName ?? ex.movement?.name ?? (exerciseId ? movementById[exerciseId] : null) ?? "Unknown exercise";
            return (
            <View key={ex.workout_exercise_id ?? index} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>
                {exerciseName}
              </Text>
              {ex.area_of_activation && ex.area_of_activation.length > 0 && (
                <Text style={styles.areaText}>{ex.area_of_activation.join(", ")}</Text>
              )}
              <View style={styles.exerciseStats}>
                <Text style={styles.statLine}>
                  {ex.sets} sets × {ex.reps} reps
                </Text>
                {(ex.workout_highest_lift != null && ex.workout_highest_lift > 0) ||
                (ex.total_weight_lifted != null && ex.total_weight_lifted > 0) ? (
                  <Text style={styles.statLine}>
                    {ex.workout_highest_lift != null && ex.workout_highest_lift > 0
                      ? `${ex.workout_highest_lift} lbs top`
                      : ""}
                    {ex.workout_highest_lift != null &&
                    ex.workout_highest_lift > 0 &&
                    ex.total_weight_lifted != null &&
                    ex.total_weight_lifted > 0
                      ? " • "
                      : ""}
                    {ex.total_weight_lifted != null && ex.total_weight_lifted > 0
                      ? `${Math.round(ex.total_weight_lifted).toLocaleString()} lbs total`
                      : ""}
                  </Text>
                ) : null}
              </View>
            </View>
          );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screenBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#51607a",
  },
  errorText: {
    fontSize: 15,
    color: "#c53030",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: "#f4f6fa",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e85d04",
  },
  statLabel: {
    fontSize: 13,
    color: "#51607a",
    marginTop: 2,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#51607a",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 15,
    color: "#e85d04",
    lineHeight: 22,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e85d04",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#51607a",
    textAlign: "center",
    paddingVertical: 32,
  },
  exerciseCard: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8ecf4",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e85d04",
    marginBottom: 4,
  },
  areaText: {
    fontSize: 13,
    color: "#51607a",
    marginBottom: 8,
  },
  exerciseStats: {
    gap: 4,
  },
  statLine: {
    fontSize: 14,
    color: "#e85d04",
  },
});

export default WorkoutDetailPage;
