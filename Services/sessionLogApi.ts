/**
 * Session Log API Service
 * 
 * This file contains all API functions related to session log (workout session) operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

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
    "/session-log/api/",
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
    `/session-log/api/${logId}`,
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
    `/session-log/api/${logId}`,
    {
      method: "DELETE",
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Gets a session log (workout session) by ID from the backend
 * 
 * @param logId - The ID of the session log to retrieve
 * @returns Promise with the session log data
 */
export const getSessionLogById = async (
  logId: number | string
): Promise<any> => {
  const response = await apiRequest(
    `/session-log/api/${logId}`,
    {
      method: "GET",
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Gets all session logs (workout sessions) for the current user
 * 
 * @returns Promise with array of session logs for the user
 */
export const getSessionLogsForUser = async (): Promise<any> => {
  const response = await apiRequest(
    "/session-log/api/",
    {
      method: "GET",
    }
  );

  return parseJsonResponse(response);
};
