import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

// API Configuration
const API_BASE_URL = "http://localhost:8080";

// Get the current user's sub ID from AWS Amplify
export const getCurrentUserSub = async (): Promise<string | null> => {
  try {
    const { userId } = await getCurrentUser();
    return userId; // userId is the sub (subject) from Cognito
  } catch (error) {
    console.error("Error getting current user sub:", error);
    return null;
  }
};

// Common headers for API requests
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

// API request wrapper with error handling
// Automatically includes user sub ID in request body and access token in headers
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  includeSub: boolean = true
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let requestBody = options.body;
  
  // If includeSub is true and body is JSON, add sub to the request body
  if (includeSub && requestBody) {
    try {
      const sub = await getCurrentUserSub();
      if (sub) {
        const bodyObj = typeof requestBody === "string" 
          ? JSON.parse(requestBody) 
          : requestBody;
        
        // Add sub to the body object
        const bodyWithSub = {
          ...bodyObj,
          sub: sub, // Add sub as primary key
        };
        
        requestBody = JSON.stringify(bodyWithSub);
      }
    } catch (error) {
      console.warn("Could not add sub to request body:", error);
      // Continue with original body if parsing fails
    }
  }
  
  // Get access token from Amplify auth session
  let accessToken: string | null = null;
  try {
    const session = await fetchAuthSession();
    accessToken = session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    // User might not be authenticated, continue without token
    // Backend will handle unauthenticated requests appropriately
    console.warn("Could not get access token:", error);
  }
  
  // Build headers with access token if available
  const headers: Record<string, string> = {
    ...getDefaultHeaders(),
    ...(options.headers as Record<string, string>),
  };
  
  // Add Authorization header with access token if available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  const config: RequestInit = {
    ...options,
    body: requestBody,
    headers,
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error: any) {
    console.error(`API request failed for ${endpoint}:`, error);
    console.error(`Request URL: ${url}`);
    console.error(`Request method: ${config.method}`);
    console.error(`Request headers:`, config.headers);
    console.error(`Request body:`, requestBody);
    // Re-throw with more context
    throw new Error(`Network request failed: ${error.message || 'Unknown error'}. URL: ${url}`);
  }
};

// Helper to parse JSON response with error handling
export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;
    
    // Try to get error message from response body
    let errorMessage = `HTTP error! status: ${status} ${statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response isn't JSON, use status text
      const text = await response.text().catch(() => '');
      errorMessage = text || errorMessage;
    }
    
    console.error(`API response error - Status: ${status}, Message: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  return response.json();
};

export default {
  API_BASE_URL,
  getCurrentUserSub,
  getDefaultHeaders,
  apiRequest,
  parseJsonResponse,
};

