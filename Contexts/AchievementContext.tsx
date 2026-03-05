import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { getNotifications } from "../Services/notificationsApi";
import type { Notification } from "../Services/notificationsApi";

interface AchievementContextType {
  activeAchievement: Notification | null;
  dismissAchievement: () => void;
  triggerAchievementCheck: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

const FETCH_THROTTLE_MS = 60_000;

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [activeAchievement, setActiveAchievement] =
    useState<Notification | null>(null);
  const shownMedalIds = useRef<Set<number>>(new Set());
  const lastFetchTime = useRef<number>(0);

  const dismissAchievement = useCallback(() => {
    setActiveAchievement(null);
  }, []);

  const triggerAchievementCheck = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_THROTTLE_MS) return;
    lastFetchTime.current = now;

    try {
      const result = await getNotifications(0, 20);
      const medalNotifications = (result.content ?? []).filter(
        (n) => n.type === "MEDAL_EARNED" && n.medalId != null
      );
      const toShow = medalNotifications.find(
        (n) => !shownMedalIds.current.has(n.medalId!)
      );
      if (toShow) {
        shownMedalIds.current.add(toShow.medalId!);
        setActiveAchievement(toShow);
      }
    } catch {
      // Ignore fetch errors
    }
  }, []);

  return (
    <AchievementContext.Provider
      value={{
        activeAchievement,
        dismissAchievement,
        triggerAchievementCheck,
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
