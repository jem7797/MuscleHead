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
}

export const getAllMedals = async (): Promise<Medal[]> => {
  const response = await apiRequest("/medal/api/all", { method: "GET" }, false);
  const data = await parseJsonResponse<Medal[]>(response);
  return Array.isArray(data) ? data : [];
};
