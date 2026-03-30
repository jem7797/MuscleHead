import { RealtimeChannel } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { LiveWorkoutSession } from "./sessionService";

export function subscribeToStatus({
  sessionId,
  onStatusUpdate,
}: {
  sessionId: string;
  onStatusUpdate: (payload: {
    event: string;
    new?: LiveWorkoutSession;
    old?: LiveWorkoutSession;
  }) => void;
}): { channel: RealtimeChannel | null; unsubscribe: () => void } {
  if (!isSupabaseConfigured()) {
    console.log(
      "[live_workout_sessions realtime] skip: Supabase not configured (sessionId=%s)",
      sessionId,
    );
    return { channel: null, unsubscribe: () => {} };
  }

  console.log("[live_workout_sessions realtime] subscribing", {
    channelName: `session-status:${sessionId}`,
    table: "live_workout_sessions",
    filter: `id=eq.${sessionId}`,
  });

  const channel = supabase
    .channel(`session-status:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "live_workout_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        const newData = (payload as unknown as { new?: { status?: string } })
          .new;
        const oldData = (payload as unknown as { old?: { status?: string } })
          .old;

        const pgEvent =
          (payload as { eventType?: string; event?: string }).eventType ??
          (payload as { event?: string }).event ??
          "?";
        console.log("[live_workout_sessions]", {
          sessionId,
          postgresEvent: pgEvent,
          oldStatus: oldData?.status,
          newStatus: newData?.status,
        });

        if (newData?.status == oldData?.status) {
          return;
        }

        onStatusUpdate({
          event:
            (payload as { eventType?: string; event?: string }).eventType ??
            (payload as { event?: string }).event ??
            "UPDATE",
          new: (payload as unknown as { new?: LiveWorkoutSession }).new,
          old: (payload as unknown as { old?: LiveWorkoutSession }).old,
        });
      },
    )
    .subscribe((status, err) => {
      console.log("[live_workout_sessions realtime] channel subscribe", {
        sessionId,
        status,
        channelError: err?.message ?? null,
      });
    });

  const unsubscribe = () => {
    console.log("[live_workout_sessions realtime] unsubscribe", { sessionId });
    supabase.removeChannel(channel);
  };

  return { channel, unsubscribe };
}
