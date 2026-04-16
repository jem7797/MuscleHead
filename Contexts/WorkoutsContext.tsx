import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  getSessionLogsForUser,
  type SessionLogApiResponse,
} from "../Services/sessionLogApi";
import type { WorkoutSession } from "../Components/WorkoutCard";

const PAGE_SIZE = 10;

interface WorkoutsContextType {
  workouts: WorkoutSession[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalElements: number;
  fetchWorkouts: () => Promise<void>;
  loadMoreWorkouts: () => Promise<void>;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(
  undefined,
);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSubtitle(log: SessionLogApiResponse): string {
  const parts: string[] = [];
  const weight = log.total_weight_lifted;
  const mins = log.timeSpentInGym;
  if (weight != null && weight > 0)
    parts.push(`${Math.round(weight).toLocaleString()} lbs`);
  if (mins != null && mins > 0) parts.push(`${mins} min`);
  return parts.join(" • ") || formatDate(log.date);
}

function mapLogsToWorkouts(logs: SessionLogApiResponse[]): WorkoutSession[] {
  return logs.map((log) => ({
    id: log.id,
    name: formatDate(log.date),
    subtitle: formatSubtitle(log),
    date: log.date,
  }));
}

export const WorkoutsProvider = ({ children }: { children: ReactNode }) => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSessionLogsForUser({ page: 0, size: PAGE_SIZE, sort: "id,desc" });
      const content = Array.isArray(res.content) ? res.content : [];
      setWorkouts(mapLogsToWorkouts(content));
      setCurrentPage(0);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreWorkouts = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages - 1) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await getSessionLogsForUser({
        page: nextPage,
        size: PAGE_SIZE,
        sort: "id,desc",
      });
      const content = Array.isArray(res.content) ? res.content : [];
      setWorkouts((prev) => [...prev, ...mapLogsToWorkouts(content)]);
      setCurrentPage(nextPage);
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, totalPages, isLoadingMore]);

  const hasMore = currentPage < totalPages - 1 && totalPages > 0;

  return (
    <WorkoutsContext.Provider
      value={{
        workouts,
        isLoading,
        isLoadingMore,
        hasMore,
        totalElements,
        fetchWorkouts,
        loadMoreWorkouts,
      }}
    >
      {children}
    </WorkoutsContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutsContext);
  if (context === undefined) {
    throw new Error("useWorkouts must be used within a WorkoutsProvider");
  }
  return context;
};
