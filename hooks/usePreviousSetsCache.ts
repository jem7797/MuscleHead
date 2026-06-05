import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLastExerciseAttempt,
  type PreviousAttemptSet,
} from "../Services/sessionInstanceApi";

export type PreviousSets = PreviousAttemptSet[] | null;

export function usePreviousSetsCache() {
  const cacheRef = useRef<Map<number, PreviousSets>>(new Map());
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  const fetchForExercise = useCallback(async (exerciseId: number) => {
    if (cacheRef.current.has(exerciseId)) return;

    try {
      const result = await getLastExerciseAttempt(exerciseId);
      cacheRef.current.set(exerciseId, result?.sets ?? null);
    } catch {
      cacheRef.current.set(exerciseId, null);
    }
    setCacheVersion((v) => v + 1);
  }, []);

  const getPreviousSets = useCallback(
    (exerciseId: number | null | undefined): PreviousSets | undefined => {
      if (exerciseId == null) return undefined;
      if (!cacheRef.current.has(exerciseId)) return undefined;
      return cacheRef.current.get(exerciseId) ?? null;
    },
    [cacheVersion],
  );

  return { fetchForExercise, getPreviousSets };
}
