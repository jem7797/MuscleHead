import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://muscleheadbackend-production.up.railway.app";

/** CloudFront distribution URL for S3 assets (e.g. profile pictures). Set in env or replace with your distribution URL. */
export const CLOUDFRONT_BASE_URL =
  process.env.EXPO_PUBLIC_CLOUDFRONT_URL ?? "dawn6uvaz7dxq.cloudfront.net";

// Get the current user's sub ID from AWS Amplify
// Retries once after delay for cold start (Amplify may need a moment to restore session from storage)
export const getCurrentUserSub = async (): Promise<string | null> => {
  const tryGet = async (): Promise<string | null> => {
    const { userId } = await getCurrentUser();
    return userId ?? null;
  };
  try {
    return await tryGet();
  } catch (error) {
    // On cold start, Amplify storage may not be ready yet; retry once
    try {
      await new Promise((r) => setTimeout(r, 300));
      return await tryGet();
    } catch {
      return null;
    }
  }
};

// Common headers for API requests
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

// API request wrapper with error handling
// Automatically includes user sub ID in request body and ID token in headers
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
  
  // Get ID token from Amplify auth session (ID token has 'aud' claim required by backend)
  // Use forceRefresh to ensure we have the latest token
  let idToken: string | null = null;
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    const token = session.tokens?.idToken;
    
    if (token) {
      // Convert token to string - handle both string and object types
      if (typeof token === 'string') {
        idToken = (token as string).trim(); // Remove any whitespace
      } else if (token && typeof token === 'object') {
        // If it's a JWT object, try to extract the token string
        // AWS Amplify v6 might return a CognitoIdToken object
        // Attempt to use toString if available, otherwise fallback to String(token)
        idToken = (token.toString && token.toString()) || String(token);
        idToken = idToken.trim();
      } else {
        idToken = String(token).trim();
      }
      
      // Validate token format (JWT tokens have 3 parts separated by dots)
      if (idToken && idToken.split('.').length === 3) {
        console.log(`[API] ID token retrieved successfully (length: ${idToken.length})`);
        // Log first/last few chars for debugging (not the full token for security)
        const preview = idToken.length > 20 
          ? `${idToken.substring(0, 10)}...${idToken.substring(idToken.length - 10)}`
          : idToken;

        console.log(`[API] Token preview: ${preview}`);
      
      } else if (idToken) {
        console.warn(`[API] Token retrieved but format looks invalid (not a JWT): length=${idToken.length}`);
        console.warn(`[API] Token starts with: ${idToken.substring(0, 20)}`);
        // Still use it, but log a warning
      } else {
        console.warn("[API] Token exists but could not be converted to string");
      }
    
    } else {
      console.error("[API] ERROR: No ID token available in session");
      console.error("[API] Session tokens:", session.tokens ? "exists but no idToken" : "null/undefined");
      
      if (session.tokens) {
        console.error("[API] Available tokens:", Object.keys(session.tokens));
       
        // Check if accessToken exists but idToken doesn't
          if (session.tokens.accessToken && !session.tokens.idToken) {
          console.error("[API] WARNING: accessToken exists but idToken is missing!");
          console.error("[API] This usually means the user needs to sign in again or the session needs to be refreshed.");
        }
      }
    }
  } catch (error) {
    // User might not be authenticated, continue without token
    // Backend will handle unauthenticated requests appropriately
    console.error("[API] Could not get ID token:", error);
    if (error instanceof Error) {
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }
  }
  
  // Build headers with ID token if available
  const headers: Record<string, string> = {
    ...getDefaultHeaders(),
    ...(options.headers as Record<string, string>),
  };
  
  // Add Authorization header with ID token if available
  // Backend expects: "Bearer <token>" (with space after Bearer)
  // ID token includes 'aud' claim required by backend JWT validator
  if (idToken) {
    const authHeader = `Bearer ${idToken}`;
    headers["Authorization"] = authHeader;
    console.log("[API] Authorization header added to request");
    // Verify format matches backend expectation
    if (!authHeader.startsWith("Bearer ")) {
      console.error("[API] ERROR: Authorization header does not start with 'Bearer '!");
    } else {
      console.log(`[API] Authorization header format verified: starts with 'Bearer '`);
      // Log first part of header for debugging (not the full token)
      const headerPreview = authHeader.length > 30
        ? `${authHeader.substring(0, 20)}...`
        : authHeader.substring(0, 20);
      console.log(`[API] Authorization header preview: ${headerPreview}`);
    }
  } else {
    console.warn("[API] WARNING: No Authorization header - request may fail with 403");
  }
  
  const config: RequestInit = {
    ...options,
    body: requestBody,
    headers,
  };

  try {
    console.log(`[API] Making ${config.method || 'GET'} request to: ${url}`);
    const response = await fetch(url, config);
    
    // Log response status immediately
    if (!response.ok) {
      console.error(`[API] Response not OK - Status: ${response.status} ${response.statusText}`);
      console.error(`[API] Response headers:`, Object.fromEntries(response.headers.entries()));
    }
    
    return response;
  } catch (error: any) {
    console.error(`[API] Network request failed for ${endpoint}:`, error);
    console.error(`[API] Request URL: ${url}`);
    console.error(`[API] Request method: ${config.method}`);
    console.error(`[API] Request headers:`, config.headers);
    console.error(`[API] Request body:`, requestBody);
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
    let errorDetails: any = null;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response isn't JSON, use status text
      const text = await response.text().catch(() => '');
      errorMessage = text || errorMessage;
    }
    
    console.error(`[API] Response error - Status: ${status} ${statusText}`);
    console.error(`[API] Error message: ${errorMessage}`);
    if (errorDetails) {
      console.error(`[API] Error details:`, JSON.stringify(errorDetails, null, 2));
    }
    
    // Special handling for 403 Forbidden
    if (status === 403) {
      console.error(`[API] 403 Forbidden - This usually means:`);
      console.error(`[API]   1. ID token is missing or invalid`);
      console.error(`[API]   2. Token 'aud' claim doesn't match backend App Client ID`);
      console.error(`[API]   3. User doesn't have permission for this endpoint`);
      console.error(`[API]   4. Token format is incorrect (should be 'Bearer <token>')`);
      console.error(`[API]   5. Backend endpoint requires authentication but token wasn't sent`);
    }
    
    const err = new Error(errorMessage) as Error & { status?: number };
    err.status = status;
    throw err;
  }

  // Read text first so we can handle parse failures and show what the server returned
  const text = await response.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    console.error("[API] Invalid JSON response (first 200 chars):", text.slice(0, 200));
    throw new Error(
      `Server returned invalid JSON. Response starts with: "${text.slice(0, 80).replace(/"/g, "'")}"`
    );
  }
};

export default {
  API_BASE_URL,
  getCurrentUserSub,
  getDefaultHeaders,
  apiRequest,
  parseJsonResponse,
};

