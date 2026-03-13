/**
 * S3 Presigned URL API Service
 *
 * Gets presigned URLs from the backend for direct S3 uploads.
 * Backend: POST s3/api/presigned-url with { objectKey, operation, contentType }.
 * Response includes url and contentType — use contentType in the PUT header.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export type PresignedOperation = "UPLOAD" | "DOWNLOAD";

export interface PresignedUrlResponse {
  url?: string;
  presignedUrl?: string;
  presigned_url?: string;
  contentType?: string;
  content_type?: string;
}

/**
 * Gets a presigned URL for S3 operations.
 * For UPLOAD: use the returned contentType in the PUT request Content-Type header.
 * @param objectKey - S3 object key (e.g. "users/{subId}/profile.jpg")
 * @param operation - "UPLOAD" or "DOWNLOAD"
 * @param contentType - For UPLOAD, pass the Content-Type. Backend signs with it and returns it.
 * @returns { url, contentType } — PUT to url with Content-Type: contentType
 */
export const getPresignedUrl = async (
  objectKey: string,
  operation: PresignedOperation,
  contentType?: string
): Promise<{ url: string; contentType: string }> => {
  const body: Record<string, unknown> = { objectKey, operation };
  if (contentType) {
    body.contentType = contentType;
    body.content_type = contentType;
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
  const url = data?.url ?? data?.presignedUrl ?? data?.presigned_url;
  const resContentType =
    data?.contentType ?? data?.content_type ?? contentType ?? "application/octet-stream";

  if (!url || typeof url !== "string") {
    throw new Error("Invalid presigned URL response");
  }

  return { url, contentType: resContentType };
};
