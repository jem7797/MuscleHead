import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNotifications } from "../Services/notificationsApi";
import type { Notification } from "../Services/notificationsApi";
import type { NewlyAwardedMedal } from "../Services/sessionLogApi";

const SHOWN_MEDALS_KEY = "@achievement_shown_medal_ids";

interface AchievementContextType {
  activeAchievement: Notification | null;
  dismissAchievement: () => void;
  dismissAllAndNavigate: () => void;
  triggerAchievementCheck: () => Promise<void>;
  addMedalsFromWorkout: (medals: NewlyAwardedMedal[]) => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

const FETCH_THROTTLE_MS = 60_000;

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [achievementQueue, setAchievementQueue] = useState<Notification[]>([]);
  const activeAchievement = achievementQueue[0] ?? null;
  const shownMedalIds = useRef<Set<number>>(new Set());
  const lastFetchTime = useRef<number>(0);
  const loadPromiseRef = useRef(
    AsyncStorage.getItem(SHOWN_MEDALS_KEY).then((raw) => {
      if (raw) {
        try {
          const ids = JSON.parse(raw) as number[];
          if (Array.isArray(ids)) {
            shownMedalIds.current = new Set(ids);
          }
        } catch {}
      }
    })
  );

  const persistShownMedals = useCallback(async () => {
    const ids = Array.from(shownMedalIds.current);
    await AsyncStorage.setItem(SHOWN_MEDALS_KEY, JSON.stringify(ids));
  }, []);

  const dismissAchievement = useCallback(() => {
    setAchievementQueue((prev) => prev.slice(1));
  }, []);

  const dismissAllAndNavigate = useCallback(() => {
    setAchievementQueue([]);
  }, []);

  const triggerAchievementCheck = useCallback(async () => {
    await loadPromiseRef.current;
    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_THROTTLE_MS) return;
    lastFetchTime.current = now;

    try {
      const result = await getNotifications(0, 20);
      const content = Array.isArray(result.content) ? result.content : [];
      const medalNotifications = content.filter(
        (n) => n.type === "MEDAL_EARNED" && n.medalId != null
      );
      const toShow = medalNotifications.filter(
        (n) => !shownMedalIds.current.has(n.medalId!)
      );
      if (toShow.length > 0) {
        toShow.forEach((n) => shownMedalIds.current.add(n.medalId!));
        persistShownMedals();
        setAchievementQueue((prev) => [...prev, ...toShow]);
      }
    } catch {
      // Ignore fetch errors
    }
  }, [persistShownMedals]);

  const addMedalsFromWorkout = useCallback(
    async (medals: NewlyAwardedMedal[]) => {
      if (medals.length === 0) return;
      await loadPromiseRef.current;
      const toShow = medals.filter((m) => !shownMedalIds.current.has(m.id));
      if (toShow.length === 0) return;
      toShow.forEach((m) => shownMedalIds.current.add(m.id));
      persistShownMedals();
      const asNotifications: Notification[] = toShow.map((m) => ({
        id: m.id,
        type: "MEDAL_EARNED",
        message: m.description,
        createdAt: m.awardedAt,
        read: false,
        medalId: m.id,
        medalName: m.medalName,
        medalDescription: m.description,
      }));
      setAchievementQueue((prev) => [...prev, ...asNotifications]);
    },
    [persistShownMedals]
  );

  return (
    <AchievementContext.Provider
      value={{
        activeAchievement,
        dismissAchievement,
        dismissAllAndNavigate,
        triggerAchievementCheck,
        addMedalsFromWorkout,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error("useAchievement must be used within an AchievementProvider");
  }
  return context;
};
