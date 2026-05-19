import { RealtimeChannel } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

/** Session row from live_workout_sessions (status + timer columns). */
export interface LiveSessionRow {
  id?: string;
  status?: string;
  host_user_id?: string;
  guest_user_id?: string | null;
  timer_state?: string;
  timerState?: string;
  timer_started_at?: string;
  timerStartedAt?: string;
  timer_elapsed_seconds?: number;
  timerElapsedSeconds?: number;
  [key: string]: unknown;
}

export function subscribeToSession({
  sessionId,
  onSessionUpdate,
}: {
  sessionId: string;
  onSessionUpdate: (payload: {
    event: string;
    new?: LiveSessionRow;
    old?: LiveSessionRow;
  }) => void;
}): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  if (!isSupabaseConfigured()) {
    return { channel: null, unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`session-updates:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "live_workout_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        onSessionUpdate({
          event:
            (payload as { eventType?: string; event?: string }).eventType ??
            (payload as { event?: string }).event ??
            "UPDATE",
          new: (payload as unknown as { new?: LiveSessionRow }).new,
          old: (payload as unknown as { old?: LiveSessionRow }).old,
        });
      },
    )
    .subscribe(() => {});

  const unsubscribe = () => {
    supabase.removeChannel(channel);
  };

  return { channel, unsubscribe };
}

/** @deprecated Use subscribeToSession */
export const subscribeToStatus = subscribeToSession;
