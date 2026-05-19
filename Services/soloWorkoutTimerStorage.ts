/**
 * Persists solo workout timer state so elapsed time survives backgrounding and app restarts.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "@musclehead/solo_workout_timer/";

export interface PersistedSoloWorkoutTimer {
  /** Milliseconds from completed run segments (excludes current segment). */
  accumulatedMs: number;
  /** Wall-clock ms when the current run segment started; null while paused. */
  segmentStartedAt: number | null;
  isRunning: boolean;
}

export const SOLO_TIMER_KEYS = {
  addWorkout: "solo-add-workout",
  activeRoutine: (routineId: number) => `solo-active-${routineId}`,
} as const;

const storageKey = (timerKey: string) => `${STORAGE_KEY_PREFIX}${timerKey}`;

export const getSoloWorkoutTimer = async (
  timerKey: string,
): Promise<PersistedSoloWorkoutTimer | null> => {
  if (!timerKey) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey(timerKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSoloWorkoutTimer;
    if (
      typeof parsed.accumulatedMs !== "number" ||
      typeof parsed.isRunning !== "boolean"
    ) {
      return null;
    }
    if (
      parsed.segmentStartedAt != null &&
      typeof parsed.segmentStartedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const setSoloWorkoutTimer = async (
  timerKey: string,
  state: PersistedSoloWorkoutTimer,
): Promise<void> => {
  if (!timerKey) return;
  await AsyncStorage.setItem(storageKey(timerKey), JSON.stringify(state));
};

export const clearSoloWorkoutTimer = async (timerKey: string): Promise<void> => {
  if (!timerKey) return;
  await AsyncStorage.removeItem(storageKey(timerKey));
};
