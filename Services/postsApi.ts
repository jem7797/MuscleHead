/**
 * Posts API Service
 *
 * POST /posts/api/presigned-image-url - Get presigned URL for image upload
 * PUT to uploadUrl - Upload image bytes to S3
 * POST /posts/api - Create a post
 * GET /posts/api/{id} - Single post by ID
 * GET /posts/api/feed - Feed (posts from followed users)
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

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
  profilePicVersion?: number | null;
  [key: string]: unknown;
}

export interface PostComment {
  id?: number;
  user?: PostUser;
  username?: string;
  text?: string;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface PostResponse {
  postId: number;
  userId?: string;
  user: PostUser;
  imageLink: string | null;
  caption: string;
  score: number;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  userLiked?: boolean;
  comments?: PostComment[];
  isTrophy?: boolean;
  /** Backend may return trophy instead of isTrophy */
  trophy?: boolean;
  achievementId?: number | null;
  /** Enum name for achievement posts (e.g. "BAPTISM") */
  medalName?: string | null;
  /** Achievement description for trophy posts (e.g. "Complete your first workout") */
  description?: string | null;
  [key: string]: unknown;
}

export interface PostPatchRequest {
  like?: boolean;
  comment?: string;
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
 * Creates an achievement/trophy post (share a medal to the feed).
 * POST /posts/api
 * Body: { userId, isTrophy: true, achievementId, caption: "" }
 */
export const createAchievementPost = async (
  achievementId: number
): Promise<CreatePostResponse> => {
  const userId = await getCurrentUserSub();
  if (!userId) throw new Error("Not authenticated");
  const body = {
    userId,
    caption: "",
    isTrophy: true,
    achievementId,
  };
  console.log('CREATE POST body:', JSON.stringify(body));
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
 * Patches a post (like/unlike, add comment).
 * PATCH /posts/api/{id}
 * Auth: Required
 */
export const patchPost = async (
  id: number | string,
  body: PostPatchRequest
): Promise<PostResponse> => {
  const response = await apiRequest(`/posts/api/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
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
 * Gets posts by user (for profile page).
 * GET /posts/api/user/{subId}
 * Auth: Required
 */
export const getPostsByUser = async (
  subId: string,
  page: number = 0,
  size: number = 50
): Promise<FeedPageResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "timestamp,desc",
  });
  const response = await apiRequest(`/posts/api/user/${subId}?${params}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<FeedPageResponse>(response);
  const posts = data.content ?? [];
  console.log('GET posts response:', JSON.stringify(posts));
  return data;
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
  const data = await parseJsonResponse<FeedPageResponse>(response);
  const posts = data.content ?? [];
  console.log('GET posts response:', JSON.stringify(posts));
  return data;
};
