/**
 * Session Log API Service
 * 
 * This file contains all API functions related to session log (workout session) operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

/**
 * Creates a new session log (workout session) in the backend
 * 
 * @param sessionLogData - The session log data to create
 * @returns Promise with the created session log data
 */
export const createSessionLog = async (
  sessionLogData: any
): Promise<any> => {
  const response = await apiRequest(
    "/sessionLog/api/",
    {
      method: "POST",
      body: JSON.stringify(sessionLogData),
    }
  );

  return parseJsonResponse(response);
};

/**
 * Updates an existing session log (workout session) in the backend
 * 
 * @param logId - The ID of the session log to update
 * @param updateData - Object containing fields to update
 * @returns Promise with updated session log data
 */
export const updateSessionLog = async (
  logId: number | string,
  updateData: Record<string, any>
): Promise<any> => {
  const requestBody = JSON.stringify(updateData);

  const response = await apiRequest(
    `/sessionLog/api/${logId}`,
    {
      method: "PUT",
      body: requestBody,
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Deletes a session log (workout session) from the backend
 * 
 * @param logId - The ID of the session log to delete
 * @returns Promise with deletion confirmation
 */
export const deleteSessionLog = async (
  logId: number | string
): Promise<any> => {
  const response = await apiRequest(
    `/sessionLog/api/${logId}`,
    {
      method: "DELETE",
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Gets a session log (workout session) by ID from the backend
 * GET /sessionLog/api/{id}
 *
 * @param logId - The ID of the session log to retrieve
 * @returns Promise with the session log data including sessionInstances
 */
export const getSessionLogById = async (
  logId: number | string
): Promise<SessionLogApiResponse> => {
  const response = await apiRequest(
    `/sessionLog/api/${logId}`,
    {
      method: "GET",
    },
    false
  );

  return parseJsonResponse<SessionLogApiResponse>(response);
};

/** Raw session log from API (GET /sessionLog/api/{id} or user list) */
export interface SessionLogApiResponse {
  id: number;
  date: string;
  notes?: string | null;
  total_weight_lifted?: number;
  session_highest_lift?: number;
  total_duration?: number;
  timeSpentInGym?: number;
  user?: unknown;
  routine?: { id?: number; name?: string } | null;
  sessionInstances?: SessionInstanceApiResponse[];
}

/** Session instance (exercise performed in a workout) - flexible for various API shapes */
export interface SessionInstanceApiResponse {
  id?: number;
  exerciseId?: number;
  exercise?: { id?: number; name?: string };
  sets?: number;
  reps?: number;
  weight?: number;
  setInstances?: { reps?: number; weight?: number }[];
  notes?: string | null;
}

/** Backend pagination format: page.size, page.number, page.totalElements, page.totalPages */
interface SessionLogsPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

/** Raw API response from GET /sessionLog/api/user/{subId} */
interface SessionLogsApiResponse {
  content: SessionLogApiResponse[];
  page?: SessionLogsPageInfo;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/** Normalized paginated response for frontend */
export interface PaginatedSessionLogsResponse {
  content: SessionLogApiResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SessionLogsPageParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Gets paginated session logs (workout sessions) for the current user
 * GET /sessionLog/api/user/{subId}?page=0&size=10&sort=id,desc
 *
 * @param params - Pagination params (page, size, sort)
 * @returns Promise with paginated session logs
 */
export const getSessionLogsForUser = async (
  params: SessionLogsPageParams = {}
): Promise<PaginatedSessionLogsResponse> => {
  const sub = await getCurrentUserSub();
  const pageNum = params.page ?? 0;
  const pageSize = params.size ?? 10;
  const sort = params.sort ?? "id,desc";

  const emptyResult = (): PaginatedSessionLogsResponse => ({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: pageSize,
    number: pageNum,
    last: true,
    first: true,
    numberOfElements: 0,
    empty: true,
  });

  if (!sub) return emptyResult();

  const query = new URLSearchParams({ page: String(pageNum), size: String(pageSize), sort });
  const response = await apiRequest(
    `/sessionLog/api/user/${sub}?${query.toString()}`,
    { method: "GET" },
    false
  );

  const data = await parseJsonResponse<SessionLogsApiResponse>(response);

  if (!data || typeof data !== "object" || !Array.isArray(data.content)) {
    return emptyResult();
  }

  const page = data.page;
  const totalElements = page?.totalElements ?? data.totalElements ?? data.content.length;
  const totalPages = page?.totalPages ?? data.totalPages ?? 1;
  const size = page?.size ?? data.size ?? pageSize;
  const number = page?.number ?? data.number ?? pageNum;

  return {
    content: data.content,
    totalElements,
    totalPages,
    size,
    number,
    last: number >= totalPages - 1,
    first: number === 0,
    numberOfElements: data.content.length,
    empty: data.content.length === 0,
  };
};
