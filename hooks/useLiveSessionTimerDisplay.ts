import { useState, useEffect, useCallback } from "react";
import {
  computeLiveTimerDisplaySeconds,
  normalizeLiveSessionTimer,
  type LiveSessionTimerSnapshot,
  type LiveSessionTimerState,
} from "../utils/liveSessionTimer";

/**
 * Renders live session elapsed time from server timer snapshots.
 * Does not run an independent workout clock — only projects from API data.
 */
export function useLiveSessionTimerDisplay() {
  const [snapshot, setSnapshot] = useState<LiveSessionTimerSnapshot | null>(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);

  const applyTimer = useCallback((timer: unknown) => {
    const next = normalizeLiveSessionTimer(timer);
    if (next) {
      setSnapshot(next);
      setDisplaySeconds(computeLiveTimerDisplaySeconds(next));
    }
  }, []);

  useEffect(() => {
    if (!snapshot) return;

    const tick = () => {
      setDisplaySeconds(computeLiveTimerDisplaySeconds(snapshot));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [snapshot]);

  const timerState: LiveSessionTimerState = snapshot?.timerState ?? "STOPPED";

  return {
    displaySeconds,
    timerState,
    applyTimer,
  };
}
