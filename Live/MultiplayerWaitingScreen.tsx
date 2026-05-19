import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import PageHeader from "../Components/PageHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { endSession } from "../lib/sessionService";
import { subscribeToSession } from "../lib/sessionStatusService";
import { supabase } from "../lib/supabase";

import { screenBackground } from "../theme/colors";
interface RouteParams {
  sessionId: string;
  currentUserId: string;
  hostUserId: string;
  guestUserId: string | null;
}

const MultiplayerWaitingScreen = () => {
  const route = useRoute();

  const navigation = useNavigation<any>();
  const params = route.params as RouteParams;
  const { sessionId, currentUserId, hostUserId, guestUserId } = params;
  const isHost = currentUserId === hostUserId;
  const [isWaitingForGuest, setIsWaitingForGuest] = useState(true);
  const [ending, setEnding] = useState(false);

  const [dots, setDots] = useState(0);
  useEffect(() => {
    if (!isWaitingForGuest) return;
    const id = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(id);
  }, [isWaitingForGuest]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const setup = async () => {
      try {
        // 1) Sign in anonymously for Supabase auth.
        await supabase.auth.signInAnonymously();

        // 2) Read Supabase session and token.
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Supabase session access token missing.");
        }

        // 3) Set Realtime auth token.
        await Promise.resolve(supabase.realtime.setAuth(session.access_token));

        // 4) Subscribe after auth is set.
        if (cancelled) return;
        const sub = subscribeToSession({
          sessionId,
          onSessionUpdate(payload) {
            if (payload.event === "UPDATE" && payload.new?.status) {
              const status = payload.new.status;
              if (status === "in_progress") {
                setIsWaitingForGuest(false);
                navigation.navigate("LiveSession", {
                  sessionId,
                  currentUserId,
                  hostUserId,
                  guestUserId: isHost ? guestUserId : currentUserId,
                });
              } else if (status === "ENDED") {
                navigation.navigate("WorkoutInputMainPage");
              }
            }
          },
        });
        unsubscribe = sub.unsubscribe;
      } catch {
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId, navigation, currentUserId, hostUserId, guestUserId, isHost]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await endSession({ sessionId });
      navigation.goBack();
    } catch {
    } finally {
      setEnding(false);
    }
  };

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
      <View style={styles.waitingOnly}>
        <Text style={styles.waitingText}>
          Waiting for guest to join{".".repeat(dots)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screenBackground,
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
    borderBottomColor: "#e85d04",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9aa6bd",
  },
  tabTextActive: {
    color: "#e85d04",
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
    color: "#e85d04",
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

export default MultiplayerWaitingScreen;
