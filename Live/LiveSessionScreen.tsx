import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import PageHeader from "../Components/PageHeader";
import WorkoutInputSection, { type WorkoutItem } from "../Components/WorkoutInputSection";
import {
  subscribeToSession,
  logExercise,
  fetchSessionExercises,
  endSession,
  type LiveSessionExercise,
} from "../lib/sessionService";

type TabKey = "host" | "guest";

interface RouteParams {
  sessionId: string;
  currentUserId: string;
  hostUserId: string;
  guestUserId: string | null;
}

const LiveSessionScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = route.params as RouteParams;
  const { sessionId, currentUserId, hostUserId, guestUserId: initialGuestUserId } = params;

  const [hostExercises, setHostExercises] = useState<LiveSessionExercise[]>([]);
  const [guestExercises, setGuestExercises] = useState<LiveSessionExercise[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("host");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  const isHost = currentUserId === hostUserId;
  const guestUserId = initialGuestUserId ?? "";

  const sortIntoLists = useCallback(
    (exercises: LiveSessionExercise[]) => {
      const host: LiveSessionExercise[] = [];
      const guest: LiveSessionExercise[] = [];
      exercises.forEach((ex) => {
        if (ex.user_id === hostUserId) host.push(ex);
        else if (ex.user_id === guestUserId) guest.push(ex);
      });
      host.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
      guest.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
      setHostExercises(host);
      setGuestExercises(guest);
    },
    [hostUserId, guestUserId]
  );

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const exercises = await fetchSessionExercises(sessionId);
        sortIntoLists(exercises);
      } catch (e) {
        console.error("Failed to load exercises:", e);
      } finally {
        setLoading(false);
      }
    };

    load();

    const { unsubscribe: unsub } = subscribeToSession({
      sessionId,
      onExerciseUpdate: (payload) => {
        if (payload.event === "INSERT" && payload.new) {
          const ex = payload.new;
          if (ex.user_id === hostUserId) {
            setHostExercises((prev) => {
              const next = [...prev, ex];
              next.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
              return next;
            });
          } else if (ex.user_id === guestUserId) {
            setGuestExercises((prev) => {
              const next = [...prev, ex];
              next.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
              return next;
            });
          }
        }
      },
    });
    unsubscribe = unsub;









    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId, hostUserId, guestUserId, sortIntoLists]);

  const handleSetComplete = async (
    exerciseName: string,
    reps: number,
    weight: number | null
  ) => {
    await logExercise({
      sessionId,
      userId: currentUserId,
      exerciseName,
      sets: 1,
      reps,
      weight: weight ?? undefined,
    });
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await endSession({ sessionId });
      navigation.goBack();
    } catch (e) {
      console.error("Failed to end session:", e);
    } finally {
      setEnding(false);
    }
  };

  const displayExercises = activeTab === "host" ? hostExercises : guestExercises;



  const listContent =
    loading ? (
      <View style={styles.centeredLoading}>
        <ActivityIndicator size="large" color="#1f2a44" />
      </View>
    ) : (
      <View style={styles.listSection}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "host" && styles.tabActive]}
            onPress={() => setActiveTab("host")}
          >
            <Text style={[styles.tabText, activeTab === "host" && styles.tabTextActive]}>
              Host
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "guest" && styles.tabActive]}
            onPress={() => setActiveTab("guest")}
          >
            <Text style={[styles.tabText, activeTab === "guest" && styles.tabTextActive]}>
              Guest
            </Text>
          </TouchableOpacity>
        </View>
        {displayExercises.length > 0 &&
          displayExercises.map((item) => (
            <View key={item.id} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{item.exercise_name}</Text>
              <Text style={styles.exerciseDetail}>
                {item.sets} × {item.reps}
                {item.weight != null ? ` @ ${item.weight} lb` : ""}
              </Text>
            </View>
          ))}
      </View>
    );

 
  return (
    <View style={styles.container}>
      <PageHeader
        title="Live Workout"
        rightComponent={
          isHost ? (
            <TouchableOpacity
              onPress={handleEndSession}
              disabled={ending}
              style={styles.endButton}
              activeOpacity={0.7}
            >
              <Text style={styles.endButtonText}>
                {ending ? "Ending..." : "End Session"}
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <WorkoutInputSection
        onDone={async () => {}}
        listContent={listContent}
        onSetComplete={handleSetComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  endButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1f2a44",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9aa6bd",
  },
  tabTextActive: {
    color: "#1f2a44",
    fontWeight: "600",
  },
  listSection: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  centeredLoading: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseRow: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf4",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
  },
  exerciseDetail: {
    fontSize: 14,
    color: "#5a6a7e",
    marginTop: 4,
  },
  waitingMessage: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  waitingOnly: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  waitingText: {
    fontSize: 16,
    color: "#9aa6bd",
  },
});

export default LiveSessionScreen;
