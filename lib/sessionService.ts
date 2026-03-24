import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  createLiveSession as apiCreateLiveSession,
  sendInvite as apiSendInvite,
  acceptInvite as apiAcceptInvite,
  declineInvite as apiDeclineInvite,
  endSession as apiEndSession,
  getSession,
  getPendingInvites,
  getSessionInviteId,
  type LiveWorkoutSession,
  type LiveSessionExercise,
  type SessionInvite,
} from "../Services/liveSessionApi";

export type { LiveWorkoutSession, LiveSessionExercise, SessionInvite };
export { getSessionInviteId };

const INVITE_POLL_INTERVAL_MS = 5000;

/**
 * Creates a new live workout session.
 * Host is derived from JWT by the backend.
 */
export async function createLiveSession(): Promise<LiveWorkoutSession> {
  return apiCreateLiveSession();
}

/**
 * Sends an invite to join a session.
 */
export async function sendInvite({
  sessionId,
  toUserId,
  message,
}: {
  sessionId: string;
  toUserId: string;
  message?: string;
}): Promise<void> {
  return apiSendInvite({ sessionId, toUserId, message });
}

/**
 * Accepts an invite by ID.
 */
export async function acceptInvite({ inviteId }: { inviteId: string }): Promise<void> {
  return apiAcceptInvite({ inviteId });
}

/**
 * Declines an invite by ID.
 */
export async function declineInvite({ inviteId }: { inviteId: string }): Promise<void> {
  return apiDeclineInvite({ inviteId });
}

/**
 * Subscribes to exercise updates for a session.
 * Uses Supabase postgres_changes on live_session_exercises.
 * Returns { channel, unsubscribe } for cleanup.
 * No-op if Supabase is not configured.
 */
export function subscribeToSession({
  sessionId,
  onExerciseUpdate,
}: {
  sessionId: string;
  onExerciseUpdate: (payload: {
    event: string;
    new?: LiveSessionExercise;
    old?: LiveSessionExercise;
  }) => void;
}): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  if (!isSupabaseConfigured()) {
    return { channel: null, unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "live_session_exercises",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        onExerciseUpdate({
          event: (payload as { eventType?: string; event?: string }).eventType ??
            (payload as { event?: string }).event ??
            "INSERT",
          new: (payload as unknown as { new?: LiveSessionExercise }).new,
          old: (payload as unknown as { old?: LiveSessionExercise }).old,
        });
      }
    )
    .subscribe();

  const unsubscribe = () => {
    supabase.removeChannel(channel);
  };

  return { channel, unsubscribe };
}

/**
 * Logs an exercise for a user in a session.
 * Uses Supabase (backend may not expose this endpoint).
 * Throws if Supabase is not configured.
 */
export async function logExercise({
  sessionId,
  userId,
  exerciseName,
  sets,
  reps,
  weight,
}: {
  sessionId: string;
  userId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number | null;
}): Promise<LiveSessionExercise> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured. Cannot log exercises.");
  }

  const { data, error } = await supabase
    .from("live_session_exercises")
    .insert({
      session_id: sessionId,
      user_id: userId,
      exercise_name: exerciseName,
      sets,
      reps,
      weight: weight ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LiveSessionExercise;
}

/**
 * Ends a session (host only).
 */
export async function endSession({ sessionId }: { sessionId: string }): Promise<void> {
  return apiEndSession({ sessionId });
}

/**
 * Listens for incoming invites by polling GET /api/live-sessions/invites/pending.
 * Returns unsubscribe function for cleanup.
 * Stops polling on 401/403 to avoid spamming when auth is invalid.
 */
export function listenForInvites({
    onInviteReceived,
}: {
  userId: string;
  onInviteReceived: (invite: SessionInvite) => void;

}): () => void {

  const seenIds = new Set<string>();
  let intervalId: ReturnType<typeof setInterval> | null = null;


  const poll = async () => {
    try {
      const invites = await getPendingInvites();
      for (const invite of invites) {
        const inviteId = getSessionInviteId(invite);
        if (!inviteId) continue;
        if (invite.status === "pending" && !seenIds.has(inviteId)) {
          seenIds.add(inviteId);
          onInviteReceived(invite);
        }
      }
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if (status === 401 || status === 403) {
        console.warn(
          "[LiveSession] Stopping invite polling due to auth failure (401/403). " +
            "Sign out and back in, or check backend Cognito App Client ID matches your token's 'aud' claim."
        );
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        console.warn("[LiveSession] Failed to fetch pending invites:", e);
      }
    }
  };

  poll();
  intervalId = setInterval(poll, INVITE_POLL_INTERVAL_MS);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}

/**
 * Fetches session details with exercises from the backend.
 */
export async function fetchSessionExercises(
  sessionId: string
): Promise<LiveSessionExercise[]> {
  const session = await getSession(sessionId);
  const exercises = session.exercises ?? [];
  return exercises.sort(
    (a, b) =>
      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
}
