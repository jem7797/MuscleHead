import { RealtimeChannel } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";
import type {  LiveWorkoutSession } from "./sessionService";

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
  
  if(!isSupabaseConfigured()){
    return {channel: null, unsubscribe: () => {}};
  }

const channel = supabase
.channel(`session:${sessionId}`)
.on("postgres_changes",{
    event: "*",
    schema: "public",
    table:"live_session_exercises",
    filter: `session_id=eq.${sessionId}`,

},
  (payload) => {
    const newData = (payload as unknown as {new?: {status?: string}}).new;
    const oldData = (payload as unknown as {old?: {status?: string}}).old;

if(newData?.status == oldData?.status){
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
.subscribe();

const unsubscribe = () => {
  supabase.removeChannel(channel);
};

return { channel, unsubscribe };
}

