import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as Haptics from "expo-haptics";
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
import SpectatorView from "../Components/SpectatorView";
import {
  subscribeToSession,
  logExercise,
  fetchSessionExercises,
  endSession,
  type LiveSessionExercise,
} from "../lib/sessionService";
import { supabase } from "../lib/supabase";
import { EXERCISE_TO_MUSCLES } from "../constants/exerciseToMuscles";
import { getUser } from "../Services/userApi";
import { subscribeToStatus } from "../lib/sessionStatusService";

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

  const isHost = currentUserId === hostUserId;
  const guestUserId = initialGuestUserId ?? "";

  const [hostExercises, setHostExercises] = useState<LiveSessionExercise[]>([]);
  const [guestExercises, setGuestExercises] = useState<LiveSessionExercise[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>(isHost ? "host" : "guest");
  const canEdit = activeTab === (isHost ? "host" : "guest");
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hostIsMale, setHostIsMale] = useState<boolean | null>(null);
  const [guestIsMale, setGuestIsMale] = useState<boolean | null>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const statusSubscriptionRef = useRef<(() => void) | null>(null);
  const didBuzzOnSummaryRef = useRef(false);

  const tearDownExerciseSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
  }, []);

  const tearDownStatusSubscription = useCallback(() => {
    if (statusSubscriptionRef.current) {
      statusSubscriptionRef.current();
      statusSubscriptionRef.current = null;
    }
  }, []);

  const tearDownAllRealtime = useCallback(() => {
    tearDownExerciseSubscription();
    tearDownStatusSubscription();
  }, [tearDownExerciseSubscription, tearDownStatusSubscription]);

  const otherExercises = isHost ? guestExercises : hostExercises;

  const { otherFrontWorked, otherBackWorked } = useMemo(() => {
    const front: string[] = [];
    const back: string[] = [];

    otherExercises.forEach((ex) => {
      const m = EXERCISE_TO_MUSCLES[ex.exercise_name];
      if (m) {
        front.push(...m.front);
        back.push(...m.back);
      }
    });

    return {
      otherFrontWorked: Array.from(new Set(front)),
      otherBackWorked: Array.from(new Set(back)),
    };
  }, [otherExercises]);

  const otherIsMale = useMemo(() => {
    const isViewingGuest = isHost && !canEdit;
    const isViewingHost = !isHost && !canEdit;

    if (isViewingGuest && guestIsMale != null) return guestIsMale;
    if (isViewingHost && hostIsMale != null) return hostIsMale;

    return true;
  }, [isHost, canEdit, hostIsMale, guestIsMale]);

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
    const load = async () => {
      setLoading(true);
      try {
        await supabase.auth.signInAnonymously();

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Supabase session missing");

        await supabase.realtime.setAuth(session.access_token);

        const exercises = await fetchSessionExercises(sessionId);
        sortIntoLists(exercises);

        const { unsubscribe: unsubExercises } = subscribeToSession({
          sessionId,
          onExerciseUpdate: (payload) => {
            if (payload.event === "INSERT" && payload.new) {
              const ex = payload.new;
              if (ex.user_id === hostUserId) {
                setHostExercises((prev) => {
                  const next = [...prev, ex];
                  next.sort(
                    (a, b) =>
                      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
                  );
                  return next;
                });
              } else if (ex.user_id === guestUserId) {
                setGuestExercises((prev) => {
                  const next = [...prev, ex];
                  next.sort(
                    (a, b) =>
                      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
                  );
                  return next;
                });
              }
            }
          },
        });
        subscriptionRef.current = unsubExercises;

        const { unsubscribe: unsubStatus } = subscribeToStatus({
          sessionId,
          onStatusUpdate: (payload) => {
            const status = payload.new?.status;
            if (!status) return;
            const ended = String(status).toUpperCase() === "ENDED";
            if (!ended) return;
            tearDownAllRealtime();
            setShowSummary(true);
            if (!didBuzzOnSummaryRef.current) {
              didBuzzOnSummaryRef.current = true;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
          },
        });
        statusSubscriptionRef.current = unsubStatus;
      } catch {
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current();
        statusSubscriptionRef.current = null;
      }
    };
  }, [sessionId, hostUserId, guestUserId, sortIntoLists, tearDownAllRealtime]);

  useEffect(() => {
    const loadParticipantGenders = async () => {
      try {
        const [hostUser, guestUser] = await Promise.all([
          getUser(hostUserId),
          guestUserId ? getUser(guestUserId) : Promise.resolve(null),
        ]);

        const hostGender = (hostUser?.gender as string | undefined) ?? undefined;
        const guestGender = (guestUser as any)?.gender as string | undefined;

        setHostIsMale(hostGender === "Female" ? false : true);
        if (guestUserId) {
          setGuestIsMale(guestGender === "Female" ? false : true);
        }
      } catch {
      }
    };

    loadParticipantGenders();
  }, [hostUserId, guestUserId]);

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
      tearDownAllRealtime();
      setShowSummary(true);
      if (!didBuzzOnSummaryRef.current) {
        didBuzzOnSummaryRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {
    } finally {
      setEnding(false);
    }
  };

  const computeStats = (exercises: LiveSessionExercise[]) => {
    return exercises.reduce(
      (acc, ex) => {
        acc.totalSets += ex.sets ?? 0;
        const reps = ex.reps ?? 0;
        acc.totalReps += (ex.sets ?? 0) * reps;
        const weight = ex.weight ?? 0;
        acc.totalVolume += (ex.sets ?? 0) * reps * weight;
        return acc;
      },
      { totalSets: 0, totalReps: 0, totalVolume: 0 },
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="Live Workout"
        rightComponent={
          isHost && !showSummary ? (
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

      {!showSummary && (
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
      )}

      {loading ? (
        <View style={styles.centeredLoading}>
          <ActivityIndicator size="large" color="#1f2a44" />
        </View>
      ) : showSummary ? (
        (() => {
          const hostStats = computeStats(hostExercises);
          const guestStats = computeStats(guestExercises);
          return (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Session Summary</Text>
              <View style={styles.summaryRowHeader}>
                <Text style={styles.summaryColLabel}></Text>
                <Text style={styles.summaryColLabel}>Host</Text>
                <Text style={styles.summaryColLabel}>Guest</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMetric}>Total Sets</Text>
                <Text style={styles.summaryValue}>{hostStats.totalSets}</Text>
                <Text style={styles.summaryValue}>{guestStats.totalSets}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMetric}>Total Reps</Text>
                <Text style={styles.summaryValue}>{hostStats.totalReps}</Text>
                <Text style={styles.summaryValue}>{guestStats.totalReps}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMetric}>Total Volume (lb)</Text>
                <Text style={styles.summaryValue}>{hostStats.totalVolume}</Text>
                <Text style={styles.summaryValue}>{guestStats.totalVolume}</Text>
              </View>
              <TouchableOpacity
                style={styles.summaryCloseButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.summaryCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          );
        })()
      ) : canEdit ? (
        <WorkoutInputSection
          onDone={async () => {}}
          listContent={null}
          onSetComplete={handleSetComplete}
          editable={canEdit}
          showDoneButton={false}
        />
      ) : (
        <SpectatorView
          exercises={otherExercises}
          frontWorked={otherFrontWorked}
          backWorked={otherBackWorked}
          isMale={otherIsMale}
        />
      )}
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
  summaryContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e6f0",
    marginBottom: 4,
  },
  summaryColLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryMetric: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    textAlign: "center",
  },
  summaryCloseButton: {
    marginTop: 28,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: "#1f2a44",
  },
  summaryCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
