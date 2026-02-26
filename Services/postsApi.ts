/**
 * Posts API Service
 *
 * POST /posts/api/presigned-image-url - Get presigned URL for image upload
 * PUT to uploadUrl - Upload image bytes to S3
 * POST /posts/api - Create a post
 * GET /posts/api/{id} - Single post by ID
 * GET /posts/api/feed - Feed (posts from followed users)
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export interface PresignedImageUrlResponse {
  uploadUrl: string;
  objectKey: string;
}

export interface CreatePostResponse {
  id?: string;
  [key: string]: unknown;
}

export interface PostUser {
  subId: string;
  username: string;
  profilePicUrl?: string;
  [key: string]: unknown;
}

export interface PostResponse {
  postId: number;
  user: PostUser;
  imageLink: string | null;
  caption: string;
  score: number;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  comments?: unknown[];
  [key: string]: unknown;
}

export interface FeedPageResponse {
  content: PostResponse[];
  pageable?: unknown;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Gets a presigned URL for uploading a post image.
 * POST /posts/api/presigned-image-url (no body)
 */
export const getPresignedImageUrl = async (): Promise<PresignedImageUrlResponse> => {
  const response = await apiRequest(
    "/posts/api/presigned-image-url",
    { method: "POST", body: JSON.stringify({}) },
    false
  );
  const data = await parseJsonResponse<PresignedImageUrlResponse>(response);
  if (!data?.uploadUrl || !data?.objectKey) {
    throw new Error("Invalid presigned URL response");
  }
  return data;
};

/**
 * Uploads image bytes to S3 using the presigned URL.
 * @param uploadUrl - URL from getPresignedImageUrl
 * @param imageUri - Local URI of the image (e.g. from ImagePicker)
 */
export const uploadImageToS3 = async (
  uploadUrl: string,
  imageUri: string
): Promise<void> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": blob.type || "image/jpeg",
    },
  });

  if (!uploadRes.ok) {
    const err = new Error(`Image upload failed: ${uploadRes.status}`);
    (err as Error & { status?: number }).status = uploadRes.status;
    throw err;
  }
};

/**
 * Creates a post.
 * POST /posts/api
 * @param caption - Post caption (can be empty string)
 * @param imageLink - Optional objectKey from presigned upload
 */
export const createPost = async (
  caption: string,
  imageLink?: string | null
): Promise<CreatePostResponse> => {
  const body: { caption: string; imageLink?: string } = {
    caption: caption ?? "",
  };
  if (imageLink != null && imageLink !== "") {
    body.imageLink = imageLink;
  }

  const response = await apiRequest(
    "/posts/api",
    { method: "POST", body: JSON.stringify(body) },
    false
  );

  return parseJsonResponse<CreatePostResponse>(response);
};

/**
 * Gets a single post by ID.
 * GET /posts/api/{id}
 * Auth: Required (JWT in Authorization header)
 */
export const getPost = async (id: number | string): Promise<PostResponse> => {
  const response = await apiRequest(`/posts/api/${id}`, { method: "GET" });
  return parseJsonResponse<PostResponse>(response);
};

/**
 * Deletes a post.
 * DELETE /posts/api/{id}
 * Auth: Required. Users can only delete their own posts.
 */
export const deletePost = async (id: number | string): Promise<void> => {
  const response = await apiRequest(`/posts/api/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const err = new Error(`Delete failed: ${response.status}`) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
};

/**
 * Gets the feed (posts from followed users).
 * GET /posts/api/feed
 * Auth: Required
 */
export const getFeed = async (
  page: number = 0,
  size: number = 20,
  sort: string = "timestamp,desc"
): Promise<FeedPageResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });
  const response = await apiRequest(`/posts/api/feed?${params}`, {
    method: "GET",
  });
  return parseJsonResponse<FeedPageResponse>(response);
};
