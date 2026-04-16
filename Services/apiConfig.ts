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
        const bodyObj =
          typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody;

        // Add sub to the body object
        const bodyWithSub = {
          ...bodyObj,
          sub: sub, // Add sub as primary key
        };

        requestBody = JSON.stringify(bodyWithSub);
      }
    } catch {
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
      if (typeof token === "string") {
        idToken = (token as string).trim();
      } else if (token && typeof token === "object") {
        idToken = (token.toString && token.toString()) || String(token);
        idToken = idToken.trim();
      } else {
        idToken = String(token).trim();
      }
    }
  } catch {
    // User might not be authenticated, continue without token
  }

  // Build headers with ID token if available
  const headers: Record<string, string> = {
    ...getDefaultHeaders(),
    ...(options.headers as Record<string, string>),
  };

  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const config: RequestInit = {
    ...options,
    body: requestBody,
    headers,
  };

  try {
    return await fetch(url, config);
  } catch (error: any) {
    throw new Error(
      `Network request failed: ${error.message || "Unknown error"}. URL: ${url}`
    );
  }
};

// Helper to parse JSON response with error handling
export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText;

    let errorMessage = `HTTP error! status: ${status} ${statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await response.text().catch(() => "");
      errorMessage = text || errorMessage;
    }

    const err = new Error(errorMessage) as Error & { status?: number };
    err.status = status;
    throw err;
  }

  const text = await response.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
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
