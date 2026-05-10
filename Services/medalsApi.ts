/**
 * Medals API Service
 *
 * GET /medal/api/all – Returns the full medal catalog with earned status.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export interface Medal {
  medalName: string;
  description: string;
  earned: boolean;
  awardedAt: string | null;
  /** user_medals.id – present when earned; required for trophy posts */
  achievementId?: number | null;
  id?: number | null;
}

type MedalApiEnvelope = {
  content?: Medal[];
  medals?: Medal[];
  totalPages?: number;
  number?: number;
};

const extractMedals = (data: unknown): Medal[] => {
  if (Array.isArray(data)) return data as Medal[];
  if (data && typeof data === "object") {
    const envelope = data as MedalApiEnvelope;
    if (Array.isArray(envelope.content)) return envelope.content;
    if (Array.isArray(envelope.medals)) return envelope.medals;
  }
  return [];
};

export const getAllMedals = async (): Promise<Medal[]> => {
  const firstResponse = await apiRequest(
    "/medal/api/all?page=0&size=200",
    { method: "GET" },
    false,
  );
  const firstData = await parseJsonResponse<unknown>(firstResponse);
  const firstPageMedals = extractMedals(firstData);

  // Non-paginated response (plain array or wrapped array without paging metadata)
  if (
    Array.isArray(firstData) ||
    !(firstData && typeof firstData === "object" && "totalPages" in firstData)
  ) {
    return firstPageMedals;
  }

  const envelope = firstData as MedalApiEnvelope;
  const totalPages = Math.max(1, envelope.totalPages ?? 1);
  if (totalPages <= 1) return firstPageMedals;

  const pages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => i + 1).map(async (page) => {
      const res = await apiRequest(
        `/medal/api/all?page=${page}&size=200`,
        { method: "GET" },
        false,
      );
      const pageData = await parseJsonResponse<unknown>(res);
      return extractMedals(pageData);
    }),
  );

  // Deduplicate by medal name so merged pages/wrappers do not create duplicates.
  const merged = [...firstPageMedals, ...pages.flat()];
  const seen = new Set<string>();
  return merged.filter((m) => {
    const key = m.medalName ?? "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
