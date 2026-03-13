/**
 * Movement API Service
 *
 * Fetches movements (exercises) from the backend for display by name
 * and for using movement id when creating session logs.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export interface Movement {
  id: number;
  name: string;
  areaOfActivation: string;
  description: string;
}

/** Normalize raw API item to Movement (handles camelCase and snake_case) */
function toMovement(raw: any): Movement {
  const id = raw?.id ?? raw?.movement_id ?? raw?.exercise_id ?? 0;
  const name = raw?.name ?? raw?.movement_name ?? raw?.exercise_name ?? "";
  const areaOfActivation = raw?.areaOfActivation ?? raw?.area_of_activation ?? "";
  const description = raw?.description ?? "";
  return { id, name, areaOfActivation, description };
}

/**
 * Fetches all movements from the backend.
 * Each movement has id, name, areaOfActivation, and description.
 */
export const getMovements = async (): Promise<Movement[]> => {
  const response = await apiRequest("/movement/api/", {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  const arr = Array.isArray(data) ? data : data?.content ?? data?.items ?? [];
  return arr.map(toMovement).filter((m) => m.id && m.name);
};
