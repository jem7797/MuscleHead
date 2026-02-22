/**
 * User API Service
 * 
 * This file contains all API functions related to user operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

/**
 * Creates a new user in the backend database
 * 
 * Flow:
 * 1. User signs up with AWS Cognito (handled in SignUp component)
 * 2. Cognito returns a userId (which is the "sub" - subject identifier)
 * 3. We send all required user data to our backend
 * 4. Backend stores this in the database with sub_id as the primary key
 * 
 * @param username - The username/alias the user chose (e.g., "Johnny7797")
 * @param sub - The user's sub ID from AWS Cognito (UUID format)
 * @param email - The user's email address
 * @param firstName - The user's first name
 * @param birthYear - The user's birth year as a string (e.g., "1990")
 * @param optionalFields - Optional fields like height, weight, etc.
 * @returns Promise with the created user data from the backend
 */
export const createUser = async (
  username: string,
  sub: string,
  email: string,
  firstName: string,
  birthYear: string,
  optionalFields?: {
    height?: number;
    weight?: number;
    show_weight?: boolean;
    show_height?: boolean;
    stat_tracking?: boolean;
    privacy_setting?: string;
    profilePicUrl?: string;
  }
): Promise<any> => {
  // Step 1: Prepare the request body with all required fields
  // Backend expects: sub_id, username, email, first_name, birth_year (as integer)
  const requestBody: any = {
    sub_id: sub, // Backend expects sub_id (not sub) - must be valid UUID
    username: username, // Cannot be blank
    email: email, // Must be valid email format
    first_name: firstName, // Cannot be blank
    birth_year: parseInt(birthYear, 10), // Convert to integer, must be 1920+ and user must be at least 16
  };

  // Step 2: Add optional fields if provided
  if (optionalFields) {
    if (optionalFields.height !== undefined) {
      requestBody.height = optionalFields.height; // Must be positive if provided
    }
    if (optionalFields.weight !== undefined) {
      requestBody.weight = optionalFields.weight; // Must be positive if provided
    }
    if (optionalFields.show_weight !== undefined) {
      requestBody.show_weight = optionalFields.show_weight;
    }
    if (optionalFields.show_height !== undefined) {
      requestBody.show_height = optionalFields.show_height;
    }
    if (optionalFields.stat_tracking !== undefined) {
      requestBody.stat_tracking = optionalFields.stat_tracking;
    }
    if (optionalFields.privacy_setting !== undefined) {
      requestBody.privacy_setting = optionalFields.privacy_setting;
    }
    if (optionalFields.profilePicUrl !== undefined) {
      requestBody.profilePicUrl = optionalFields.profilePicUrl;
    }
  }

  // Step 3: Make the API request to create the user
  const response = await apiRequest(
    "/user/api/", // Endpoint path (will be combined with base URL from apiConfig)
    {
      method: "POST", // HTTP method for creating a new resource
      body: JSON.stringify(requestBody), // The data we're sending to the backend
    },
    false // Don't auto-add sub since we're including it manually
  );

  // Step 4: Parse the JSON response and return it
  // This will throw an error if the response is not OK (4xx, 5xx status codes)
  return parseJsonResponse(response);
};

/**
 * Gets the current user's profile from the backend (uses JWT, no subId needed)
 * Use for pull-to-refresh or when returning to profile screen.
 *
 * GET user/api/me
 * Authorization: Bearer <jwt>
 *
 * @returns Promise with full user data (nemesis, stats, etc.)
 */
export const getCurrentUserProfile = async (): Promise<any> => {
  const response = await apiRequest("/user/api/me", { method: "GET" });
  return parseJsonResponse(response);
};

/**
 * Gets user information from the backend
 * 
 * @param sub - The user's sub ID from AWS Cognito
 * @returns Promise with user data from the backend
 */
export const getUser = async (sub: string): Promise<any> => {
  // Backend expects subId as query param: GET /user/api/?subId={sub}
  // Some backends use path param: GET /user/api/{sub} - try that if you get 404
  const response = await apiRequest(`/user/api/?subId=${sub}`, {
    method: "GET",
  });

  return parseJsonResponse(response);
};

/**
 * Updates user information in the backend (partial update)
 *
 * Uses PATCH per backend: user/api/{subId}
 * Send only the fields you want to change.
 *
 * @param sub - The user's sub ID from AWS Cognito
 * @param updateData - Object containing only the fields to update
 * @returns Promise with updated user data
 */
export const updateUser = async (
  sub: string,
  updateData: Record<string, any>
): Promise<any> => {
  const response = await apiRequest(
    `/user/api/${sub}`,
    {
      method: "PATCH",
      body: JSON.stringify(updateData),
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Updates the current user's nemesis list (add)
 * PATCH user/api/{subId} with { nemesisSubIds: string[] }
 *
 * @param userSubId - The current user's sub ID
 * @param nemesisSubIds - Array of nemesis sub IDs
 */
export const updateUserNemesis = async (
  userSubId: string,
  nemesisSubIds: string[]
): Promise<any> => {
  return updateUser(userSubId, { nemesisSubIds });
};

/**
 * Removes a nemesis from the current user's list
 * DELETE user/api/{subId}/nemesis/{nemesisSubId}
 *
 * @param userSubId - The current user's sub ID
 * @param nemesisSubId - The nemesis sub ID to remove
 */
export const removeNemesis = async (
  userSubId: string,
  nemesisSubId: string
): Promise<any> => {
  const response = await apiRequest(
    `/user/api/${userSubId}/nemesis/${nemesisSubId}`,
    { method: "DELETE" },
    false
  );
  return parseJsonResponse(response);
};

/**
 * Searches users by query string
 *
 * GET user/api/search?q={query}&page={page}&size={size}
 * Queries shorter than 2 characters return 400 Bad Request.
 *
 * @param q - Search term (required, min 2 chars)
 * @param page - Page number (default 0)
 * @param size - Page size (default 10)
 * @returns Spring Page: { content, totalElements, totalPages, number, size }
 */
export interface SearchUsersResponse {
  content: Array<{
    sub_id?: string;
    username?: string;
    first_name?: string;
    profile_pic_url?: string;
    profilePicUrl?: string;
    [key: string]: unknown;
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const searchUsers = async (
  q: string,
  page: number = 0,
  size: number = 10
): Promise<SearchUsersResponse> => {
  if (q.trim().length < 2) {
    throw new Error("Search query must be at least 2 characters");
  }
  const params = new URLSearchParams({
    q: q.trim(),
    page: String(page),
    size: String(size),
  });
  const response = await apiRequest(`/user/api/search?${params}`, {
    method: "GET",
  });
  return parseJsonResponse<SearchUsersResponse>(response);
};

/**
 * Deletes a user from the backend
 * 
 * @param sub - The user's sub ID from AWS Cognito
 * @returns Promise with deletion confirmation
 */
export const deleteUser = async (sub: string): Promise<any> => {
  // Backend expects subId in the URL path (not as query parameter)
  const response = await apiRequest(
    `/user/api/${sub}`, // Path parameter like PUT
    {
      method: "DELETE",
    },
    false
  );

  return parseJsonResponse(response);
};

