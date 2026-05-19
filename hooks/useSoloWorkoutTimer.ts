import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { formatDuration } from "../utils/formatDuration";
import {
  getSoloWorkoutTimer,
  setSoloWorkoutTimer,
  clearSoloWorkoutTimer,
  type PersistedSoloWorkoutTimer,
} from "../Services/soloWorkoutTimerStorage";

const computeElapsedMs = (state: PersistedSoloWorkoutTimer): number => {
  let ms = Math.max(0, state.accumulatedMs);
  if (state.isRunning && state.segmentStartedAt != null) {
    ms += Math.max(0, Date.now() - state.segmentStartedAt);
  }
  return ms;
};

const freshRunningState = (): PersistedSoloWorkoutTimer => ({
  accumulatedMs: 0,
  segmentStartedAt: Date.now(),
  isRunning: true,
});

/**
 * Wall-clock solo workout timer with AsyncStorage persistence.
 * Survives backgrounding and app restarts; supports pause/resume.
 */
export function useSoloWorkoutTimer(timerKey: string) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const stateRef = useRef<PersistedSoloWorkoutTimer>(freshRunningState());

  const persist = useCallback(async () => {
    try {
      await setSoloWorkoutTimer(timerKey, stateRef.current);
    } catch {
      // ignore storage errors
    }
  }, [timerKey]);

  const syncDisplay = useCallback(() => {
    setTimerSeconds(Math.floor(computeElapsedMs(stateRef.current) / 1000));
    setIsTimerRunning(stateRef.current.isRunning);
  }, []);

  // Hydrate from storage on mount / key change.
  useEffect(() => {
    let cancelled = false;
    setIsReady(false);

    (async () => {
      const saved = await getSoloWorkoutTimer(timerKey);
      if (cancelled) return;

      stateRef.current = saved ?? freshRunningState();
      if (!saved) {
        await persist();
      }
      syncDisplay();
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [timerKey, persist, syncDisplay]);

  // Refresh display every second and when app returns to foreground.
  useEffect(() => {
    if (!isReady) return;

    syncDisplay();
    const intervalId = setInterval(syncDisplay, 1000);

    const onAppStateChange = (next: AppStateStatus) => {
      if (next === "active") {
        syncDisplay();
      } else if (next === "background" || next === "inactive") {
        persist();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [isReady, syncDisplay, persist]);

  const toggleTimer = useCallback(() => {
    const current = stateRef.current;
    const now = Date.now();

    if (current.isRunning && current.segmentStartedAt != null) {
      stateRef.current = {
        accumulatedMs:
          current.accumulatedMs + Math.max(0, now - current.segmentStartedAt),
        segmentStartedAt: null,
        isRunning: false,
      };
    } else {
      stateRef.current = {
        accumulatedMs: current.accumulatedMs,
        segmentStartedAt: now,
        isRunning: true,
      };
    }

    syncDisplay();
    persist();
  }, [persist, syncDisplay]);

  const getElapsedSeconds = useCallback(
    () => Math.floor(computeElapsedMs(stateRef.current) / 1000),
    [],
  );

  const clearTimer = useCallback(async () => {
    await clearSoloWorkoutTimer(timerKey);
    stateRef.current = {
      accumulatedMs: 0,
      segmentStartedAt: null,
      isRunning: false,
    };
    syncDisplay();
  }, [timerKey, syncDisplay]);

  const formatTime = useCallback(
    (seconds: number = timerSeconds) => formatDuration(seconds),
    [timerSeconds],
  );

  return {
    timerSeconds,
    isTimerRunning,
    isReady,
    toggleTimer,
    getElapsedSeconds,
    clearTimer,
    formatTime,
  };
}
