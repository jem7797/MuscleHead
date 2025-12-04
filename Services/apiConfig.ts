import { getCurrentUser } from "aws-amplify/auth";

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
// Automatically includes user sub ID in request body or headers if needed
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
  
  const config: RequestInit = {
    ...options,
    body: requestBody,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper to parse JSON response with error handling
export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

