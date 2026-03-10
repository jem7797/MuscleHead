import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PageHeader from "../Components/PageHeader";
import PrimaryButton from "../Components/PrimaryButton";
import LogExerciseModal from "../Components/LogExerciseModal";
import NavBar from "../Components/NavBar";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [ending, setEnding] = useState(false);

  const isHost = currentUserId === hostUserId;
  const guestUserId = initialGuestUserId ?? "";
  const canLogOnHostTab = isHost && activeTab === "host";
  const canLogOnGuestTab = !isHost && activeTab === "guest";
  const canLog = canLogOnHostTab || canLogOnGuestTab;

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
          setHostExercises((prev) => {
            const next = [...prev];
            if (payload.new!.user_id === hostUserId) {
              next.push(payload.new!);
              next.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
            }
            return next;
          });
          setGuestExercises((prev) => {
            const next = [...prev];
            if (payload.new!.user_id === guestUserId) {
              next.push(payload.new!);
              next.sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
            }
            return next;
          });
        }
      },
    });
    unsubscribe = unsub;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId, hostUserId, guestUserId, sortIntoLists]);

  const handleLogExercise = async (data: {
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number | null;
  }) => {
    await logExercise({
      sessionId,
      userId: currentUserId,
      exerciseName: data.exerciseName,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
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

  const renderExerciseItem = ({ item }: { item: LiveSessionExercise }) => (
    <View style={styles.exerciseRow}>
      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
      <Text style={styles.exerciseDetail}>
        {item.sets} × {item.reps}
        {item.weight != null ? ` @ ${item.weight} lb` : ""}
      </Text>
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
            >
              <Text style={styles.endButtonText}>{ending ? "Ending..." : "End Session"}</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1f2a44" />
        </View>
      ) : (
        <FlatList
          data={displayExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No exercises logged yet</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {canLog && (
        <View style={styles.footer}>
          <PrimaryButton
            label="Log Exercise"
            onPress={() => setModalVisible(true)}
            variant="footer"
          />
        </View>
      )}

      <LogExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleLogExercise}
      />

      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  endButton: {
    padding: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c0392b",
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
  listContent: {
    padding: 20,
    paddingBottom: 120,
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
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9aa6bd",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e6f0",
  },
});

export default LiveSessionScreen;
