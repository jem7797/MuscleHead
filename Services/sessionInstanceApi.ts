/**
 * Session Instance API Service
 * 
 * This file contains all API functions related to session instance (workout exercise) operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

/**
 * Creates a new session instance (workout exercise) in the backend
 * 
 * @param sessionInstanceData - The session instance data to create
 * @returns Promise with the created session instance data
 */
export const createSessionInstance = async (
  sessionInstanceData: any
): Promise<any> => {
  const response = await apiRequest(
    "/session-instance/api/",
    {
      method: "POST",
      body: JSON.stringify(sessionInstanceData),
    }
  );

  return parseJsonResponse(response);
};

/**
 * Updates an existing session instance (workout exercise) in the backend
 * 
 * @param instanceId - The ID of the session instance to update
 * @param updateData - Object containing fields to update
 * @returns Promise with updated session instance data
 */
export const updateSessionInstance = async (
  instanceId: number | string,
  updateData: Record<string, any>
): Promise<any> => {
  const requestBody = JSON.stringify(updateData);

  const response = await apiRequest(
    `/session-instance/api/${instanceId}`,
    {
      method: "PUT",
      body: requestBody,
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Deletes a session instance (workout exercise) from the backend
 * 
 * @param instanceId - The ID of the session instance to delete
 * @returns Promise with deletion confirmation
 */
export const deleteSessionInstance = async (
  instanceId: number | string
): Promise<any> => {
  const response = await apiRequest(
    `/session-instance/api/${instanceId}`,
    {
      method: "DELETE",
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Gets a session instance (workout exercise) by ID from the backend
 * 
 * @param instanceId - The ID of the session instance to retrieve
 * @returns Promise with the session instance data
 */
export const getSessionInstanceById = async (
  instanceId: number | string
): Promise<any> => {
  const response = await apiRequest(
    `/session-instance/api/${instanceId}`,
    {
      method: "GET",
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Gets all session instances (workout exercises) for the current user
 * 
 * @returns Promise with array of session instances for the user
 */
export const getSessionInstancesForUser = async (): Promise<any> => {
  const response = await apiRequest(
    "/session-instance/api/",
    {
      method: "GET",
    }
  );

  return parseJsonResponse(response);
};
