import type { PreviousAttemptSet } from "../Services/sessionInstanceApi";

export type ComparisonDirection = "up" | "down";

export function getRepsComparison(
  currentReps: string,
  previous: PreviousAttemptSet | undefined,
  previousSets: PreviousAttemptSet[] | null | undefined,
): ComparisonDirection | null {
  if (previousSets == null || !previous) return null;
  const trimmed = currentReps.trim();
  if (!trimmed) return null;
  const current = parseInt(trimmed, 10);
  if (Number.isNaN(current)) return null;
  if (current > previous.reps) return "up";
  if (current < previous.reps) return "down";
  return null;
}

export function getWeightComparison(
  currentWeight: string,
  previous: PreviousAttemptSet | undefined,
  previousSets: PreviousAttemptSet[] | null | undefined,
): ComparisonDirection | null {
  if (previousSets == null || !previous) return null;
  const trimmed = currentWeight.trim();
  if (!trimmed) return null;
  const current = parseFloat(trimmed);
  if (Number.isNaN(current)) return null;
  if (current > previous.weight) return "up";
  if (current < previous.weight) return "down";
  return null;
}
