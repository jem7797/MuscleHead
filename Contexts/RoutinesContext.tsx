import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUserSub } from "../Services/apiConfig";
import { getWorkoutTemplates } from "../Services/workoutTemplateApi";
import {
  getCachedRoutines,
  setCachedRoutines,
} from "../Services/routinesStorage";
import type { RoutineTemplate } from "../Components/RoutineCard";
import { useUser } from "./UserContext";

interface RoutinesContextType {
  routines: RoutineTemplate[];
  isLoading: boolean;
  fetchRoutines: () => Promise<void>;
  addRoutineOptimistically: (routine: RoutineTemplate) => void;
  removeRoutine: (routineId: number) => void;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(
  undefined,
);

export const RoutinesProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useUser();
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persistRoutines = useCallback(
    async (sub: string, list: RoutineTemplate[]) => {
      try {
        await setCachedRoutines(sub, list);
      } catch {
        // ignore storage errors
      }
    },
    [],
  );

  // Hydrate from local cache when the logged-in user changes.
  useEffect(() => {
    if (!userId) {
      setRoutines([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const cached = await getCachedRoutines(userId);
      if (!cancelled && cached.length > 0) {
        setRoutines(cached);
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const fetchRoutines = useCallback(async () => {
    setIsLoading(true);
    try {
      const sub = await getCurrentUserSub();
      if (!sub) {
        return;
      }

      const templates = await getWorkoutTemplates();
      const next = (templates as RoutineTemplate[]) ?? [];

      setRoutines((prev) => {
        if (next.length === 0 && prev.length > 0) {
          return prev;
        }
        if (next.length > 0) {
          persistRoutines(sub, next);
        }
        return next;
      });
    } catch {
      // Keep in-memory + cached routines on fetch failure.
    } finally {
      setIsLoading(false);
    }
  }, [persistRoutines]);

  const addRoutineOptimistically = useCallback(
    (routine: RoutineTemplate) => {
      setRoutines((prev) => {
        const next = [...prev, routine];
        getCurrentUserSub()
          .then((sub) => {
            if (sub) persistRoutines(sub, next);
          })
          .catch(() => {});
        return next;
      });
    },
    [persistRoutines],
  );

  const removeRoutine = useCallback(
    (routineId: number) => {
      setRoutines((prev) => {
        const next = prev.filter((r) => r.id !== routineId);
        getCurrentUserSub()
          .then((sub) => {
            if (sub) persistRoutines(sub, next);
          })
          .catch(() => {});
        return next;
      });
    },
    [persistRoutines],
  );

  return (
    <RoutinesContext.Provider
      value={{
        routines,
        isLoading,
        fetchRoutines,
        addRoutineOptimistically,
        removeRoutine,
      }}
    >
      {children}
    </RoutinesContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutinesContext);
  if (context === undefined) {
    throw new Error("useRoutines must be used within a RoutinesProvider");
  }
  return context;
};
