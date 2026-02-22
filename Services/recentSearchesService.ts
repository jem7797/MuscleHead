/**
 * Recent Searches Service
 * Persists the last 7 users the current user searched for and clicked on.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@musclehead/recent_searches";
const MAX_RECENT = 7;

export interface RecentSearchUser {
  sub_id?: string;
  subId?: string;
  username?: string;
  first_name?: string;
  profile_pic_url?: string;
  profilePicUrl?: string;
  [key: string]: unknown;
}

export const getRecentSearches = async (): Promise<RecentSearchUser[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = async (user: RecentSearchUser): Promise<void> => {
  const subId = user.sub_id ?? user.subId;
  if (!subId) return;

  const list = await getRecentSearches();
  const filtered = list.filter((u) => (u.sub_id ?? u.subId) !== subId);
  const updated = [{ ...user, sub_id: subId, subId }, ...filtered].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearRecentSearches = async (): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
};
