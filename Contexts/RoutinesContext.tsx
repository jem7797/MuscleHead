import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getWorkoutTemplates } from "../Services/workoutTemplateApi";
import type { RoutineTemplate } from "../Components/RoutineCard";

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
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoutines = useCallback(async () => {
    setIsLoading(true);
    try {
      const templates = await getWorkoutTemplates();
      setRoutines((templates as RoutineTemplate[]) ?? []);
    } catch {
      setRoutines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRoutineOptimistically = useCallback((routine: RoutineTemplate) => {
    setRoutines((prev) => [...prev, routine]);
  }, []);

  const removeRoutine = useCallback((routineId: number) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  }, []);

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
