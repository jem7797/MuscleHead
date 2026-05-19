/**
 * Persists workout routines (templates) per user so they survive refresh
 * and remain available when the API fetch fails or returns empty.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RoutineTemplate } from "../Components/RoutineCard";

const STORAGE_KEY_PREFIX = "@musclehead/routines/";

const storageKey = (subId: string) => `${STORAGE_KEY_PREFIX}${subId}`;

const isRoutineTemplate = (value: unknown): value is RoutineTemplate =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as RoutineTemplate).name === "string";

export const getCachedRoutines = async (
  subId: string,
): Promise<RoutineTemplate[]> => {
  if (!subId) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey(subId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRoutineTemplate);
  } catch {
    return [];
  }
};

export const setCachedRoutines = async (
  subId: string,
  routines: RoutineTemplate[],
): Promise<void> => {
  if (!subId) return;
  await AsyncStorage.setItem(storageKey(subId), JSON.stringify(routines));
};

export const clearCachedRoutines = async (subId: string): Promise<void> => {
  if (!subId) return;
  await AsyncStorage.removeItem(storageKey(subId));
};
