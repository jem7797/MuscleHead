/**
 * S3 Presigned URL API Service
 *
 * Gets presigned URLs from the backend for direct S3 uploads.
 * Backend: POST s3/api/presigned-url with JWT and body { objectKey, operation }.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export type PresignedOperation = "UPLOAD" | "DOWNLOAD";

export interface PresignedUrlResponse {
  url?: string;
  presignedUrl?: string;
  presigned_url?: string;
}

/**
 * Gets a presigned URL for S3 operations.
 * @param objectKey - S3 object key (e.g. "users/{subId}/profile.jpg")
 * @param operation - "UPLOAD" or "DOWNLOAD"
 * @param contentType - Optional. For UPLOAD, pass the Content-Type you'll send in the PUT. Backend must sign with the same value.
 * @returns The presigned URL
 */
export const getPresignedUrl = async (
  objectKey: string,
  operation: PresignedOperation,
  contentType?: string
): Promise<string> => {
  const body: Record<string, unknown> = { objectKey, operation };
  if (contentType) {
    body.contentType = contentType;
    body.content_type = contentType; // Backend may expect snake_case
  }

  const response = await apiRequest(
    "/s3/api/presigned-url",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    false
  );

  const data = await parseJsonResponse<PresignedUrlResponse>(response);
  const url =
    data?.url ?? data?.presignedUrl ?? data?.presigned_url;
  if (!url || typeof url !== "string") {
    throw new Error("Invalid presigned URL response");
  }
  return url;
};
