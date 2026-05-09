/**
 * User API Service
 * 
 * This file contains all API functions related to user operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

/**
 * Reports a minor (under-13) sign-up attempt to the backend.
 * Backend bans the email - no Cognito account is created.
 * Call this BEFORE Cognito signUp when age < 13.
 *
 * @param email - The minor's email
 * @param firstName - First name
 * @param birthDate - YYYY-MM-DD
 * @param username - Chosen username/alias
 */
export const reportMinorSignupAttempt = async (
  email: string,
  firstName: string,
  birthDate: string,
  username: string
): Promise<void> => {
  const birthYear = parseInt(birthDate.slice(0, 4), 10);
  const response = await apiRequest("/user/api/minor-signup-attempt", {
    method: "POST",
    body: JSON.stringify({
      email,
      first_name: firstName,
      birth_date: birthDate,
      birth_year: birthYear,
      username,
    }),
  }, false);
  if (!response.ok) await response.text().catch(() => {});
};

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
 * @param birthDate - The user's date of birth as YYYY-MM-DD (e.g., "1990-05-15")
 * @param optionalFields - Optional fields like height, weight, etc.
 * @returns Promise with the created user data from the backend
 */
export const createUser = async (
  username: string,
  sub: string,
  email: string,
  firstName: string,
  birthDate: string,
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
  // Backend expects: sub_id, username, email, first_name, birth_year (integer), birth_date (YYYY-MM-DD)
  const birthYear = parseInt(birthDate.slice(0, 4), 10);
  const requestBody: any = {
    sub_id: sub, // Backend expects sub_id (not sub) - must be valid UUID
    username: username, // Cannot be blank
    email: email, // Must be valid email format
    first_name: firstName, // Cannot be blank
    birth_year: birthYear, // Must be 1920+ and user must be at least 16
    birth_date: birthDate, // YYYY-MM-DD format (e.g. "2010-05-15")
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
 * Searches users by query string.
 * Auth: Required — backend expects JWT Bearer token in Authorization header.
 * Uses apiRequest (same as profile/post endpoints) which adds the token automatically.
 *
 * GET {baseUrl}/user/api/search?q={query}&page={page}&size={size}
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

const EMPTY_SEARCH_RESPONSE = (
  size: number,
  page: number
): SearchUsersResponse => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: page,
  size,
});

/**
 * Top recommended users (e.g. by follower count). JWT required via apiRequest.
 * GET /api/users/recommended — fails silently at call sites that catch empty results.
 */
export interface RecommendedUserDto {
  id: string;
  username: string;
  profile_picture: string;
  number_of_followers: number;
  display_name: string;
}

export interface RecommendedUsersResponse {
  recommended: RecommendedUserDto[];
}

export const fetchRecommendedUsers = async (): Promise<RecommendedUserDto[]> => {
  try {
    const response = await apiRequest("/api/users/recommended", { method: "GET" });
    if (!response.ok) {
      await response.text().catch(() => {});
      return [];
    }
    const text = await response.text();
    if (!text || !text.trim()) return [];
    const data = JSON.parse(text) as RecommendedUsersResponse;
    if (!Array.isArray(data.recommended)) return [];
    return data.recommended.slice(0, 5);
  } catch {
    return [];
  }
};

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
  // Same pattern as getCurrentUserProfile, getPost, etc.: apiRequest adds Authorization: Bearer <idToken>
  const response = await apiRequest(`/user/api/search?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    const err = new Error(`Search failed: ${response.status}`);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  const text = await response.text();
  if (!text || text.trim() === "") {
    return EMPTY_SEARCH_RESPONSE(size, page);
  }

  // Backend may return non-JSON for empty results (e.g. "Optional.empty", "ok")
  const trimmed = text.trim();
  if (
    trimmed === "Optional.empty" ||
    trimmed.toLowerCase() === "ok" ||
    trimmed.includes("[object Object]")
  ) {
    return EMPTY_SEARCH_RESPONSE(size, page);
  }

  try {
    const data = JSON.parse(text);
    return {
      content: Array.isArray(data.content) ? data.content : [],
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      number: data.number ?? page,
      size: data.size ?? size,
    };
  } catch {
    return EMPTY_SEARCH_RESPONSE(size, page);
  }
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
    `/user/api/me`, // Path parameter like PUT
    
    {
      method: "DELETE",
    },
    false
  );
  if (response.status === 204) return;
  return parseJsonResponse(response);
};

