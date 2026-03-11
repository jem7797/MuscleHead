/**
 * Persists nemesis sub IDs to AsyncStorage so they survive app refresh.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@meathead/nemesis_sub_ids";

export const getNemesisSubIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id: unknown) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export const setNemesisSubIds = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const clearNemesisSubIds = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
