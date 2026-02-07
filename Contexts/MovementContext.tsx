import React, { createContext, useContext, useState, useEffect } from "react";
import { getMovements, Movement } from "../Services/movementApi";

interface MovementContextType {
  movements: Movement[];
  movementIdByName: Record<string, number>;
  /** Resolve movement id by name (exact, then case-insensitive trimmed). */
  getMovementId: (name: string) => number | undefined;
  loading: boolean;
  error: string | null;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

export const MovementProvider = ({ children }: { children: React.ReactNode }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovements();
        if (!cancelled) {
          setMovements(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load movements");
          setMovements([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const movementIdByName: Record<string, number> = {};
  movements.forEach((m) => {
    movementIdByName[m.name] = m.id;
  });

  const getMovementId = (name: string): number | undefined => {
    if (!name) return undefined;
    const exact = movementIdByName[name];
    if (exact != null) return exact;
    const key = name.toLowerCase().trim();
    const found = movements.find((m) => m.name.toLowerCase().trim() === key);
    return found?.id;
  };

  const value: MovementContextType = {
    movements,
    movementIdByName,
    getMovementId,
    loading,
    error,
  };

  return (
    <MovementContext.Provider value={value}>
      {children}
    </MovementContext.Provider>
  );
};

export const useMovements = () => {
  const context = useContext(MovementContext);
  if (context === undefined) {
    throw new Error("useMovements must be used within MovementProvider");
  }
  return context;
};
