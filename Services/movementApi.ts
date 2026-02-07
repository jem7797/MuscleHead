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

/**
 * Fetches all movements from the backend.
 * Each movement has id, name, areaOfActivation, and description.
 */
export const getMovements = async (): Promise<Movement[]> => {
  const response = await apiRequest("/movement/api/", {
    method: "GET",
  });
  return parseJsonResponse(response);
};
