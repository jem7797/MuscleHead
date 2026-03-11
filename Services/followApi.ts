/**
 * Follow API Service
 *
 * POST   follow/api/follow/{followeeSubId}   - Public: create follow. Private: create follow request.
 * DELETE follow/api/unfollow/{followeeSubId}  - Current user unfollows followeeSubId
 * GET    follow/api/followers/{subId}         - Followers of subId
 * GET    follow/api/following/{subId}         - Users that subId follows
 * GET    follow/api/check?follower=...&followee=... - Whether follower follows followee
 *
 * Follow requests (private accounts):
 * GET    follow/api/requests                 - Pending requests for current user
 * POST   follow/api/requests/{id}/accept     - Accept request
 * POST   follow/api/requests/{id}/decline    - Decline request
 * GET    follow/api/request-status?requester=X&followee=Y - "pending" | "none"
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

export interface FollowRequestResponse {
  id: string;
  requester: { sub_id?: string; subId?: string; username?: string; first_name?: string; [key: string]: unknown };
  followeeSubId: string;
  status: string;
  createdAt: string;
}

/**
 * Current user follows followeeSubId
 */
export const follow = async (followeeSubId: string): Promise<void> => {
  const response = await apiRequest(`/follow/api/follow/${followeeSubId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Follow failed: ${response.status}`);
  }
};

/**
 * Current user unfollows followeeSubId
 */
export const unfollow = async (followeeSubId: string): Promise<void> => {
  const response = await apiRequest(`/follow/api/unfollow/${followeeSubId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Unfollow failed: ${response.status}`);
  }
};

/**
 * Get followers of subId
 */
export const getFollowers = async (subId: string): Promise<any[]> => {
  const response = await apiRequest(`/follow/api/followers/${subId}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  return Array.isArray(data) ? data : data?.content ?? data?.followers ?? [];
};

/**
 * Get users that subId follows
 */
export const getFollowing = async (subId: string): Promise<any[]> => {
  const response = await apiRequest(`/follow/api/following/${subId}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  return Array.isArray(data) ? data : data?.content ?? data?.following ?? [];
};

/**
 * Check whether follower follows followee
 * @returns true if follower follows followee
 */
export const checkFollow = async (
  followerSubId: string,
  followeeSubId: string
): Promise<boolean> => {
  const params = new URLSearchParams({
    follower: followerSubId,
    followee: followeeSubId,
  });
  const response = await apiRequest(`/follow/api/check?${params}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  return data?.following === true || data === true;
};

/**
 * Check if two users follow each other (mutual follow)
 * GET /follow/api/mutual?user1={subId}&user2={subId}
 * Returns false if either user is missing or IDs are the same.
 */
export const checkMutualFollow = async (
  user1SubId: string,
  user2SubId: string
): Promise<boolean> => {
  const params = new URLSearchParams({
    user1: user1SubId,
    user2: user2SubId,
  });
  const response = await apiRequest(`/follow/api/mutual?${params}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  return data === true || data?.mutual === true;
};

/**
 * Get list of users who have a mutual follow with the given user (friends).
 * Tries GET /follow/api/mutual?user1={subId}&user2={subId}; if backend returns
 * a list, uses it. Otherwise falls back to intersecting following and followers.
 */
export const getMutualFriends = async (userSubId: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams({ user1: userSubId, user2: userSubId });
    const response = await apiRequest(`/follow/api/mutual?${params}`, {
      method: "GET",
    });
    const data = await parseJsonResponse<any>(response);
    if (Array.isArray(data)) return data;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.users && Array.isArray(data.users)) return data.users;
  } catch {
    // Fallback
  }
  const [following, followers] = await Promise.all([
    getFollowing(userSubId),
    getFollowers(userSubId),
  ]);
  const followerIds = new Set(
    (followers || []).map((u) => (u.sub_id ?? u.subId ?? "").toString()).filter(Boolean)
  );
  return (following || []).filter((u) => {
    const id = (u.sub_id ?? u.subId ?? "").toString();
    return id && followerIds.has(id);
  });
};

/**
 * Get pending follow requests for the current user (as followee)
 */
export const getFollowRequests = async (): Promise<FollowRequestResponse[]> => {
  const response = await apiRequest("/follow/api/requests", { method: "GET" });
  const data = await parseJsonResponse<any>(response);
  const arr = Array.isArray(data) ? data : data?.content ?? data?.requests ?? [];
  return arr as FollowRequestResponse[];
};

/**
 * Accept a follow request
 */
export const acceptFollowRequest = async (requestId: string): Promise<void> => {
  const response = await apiRequest(`/follow/api/requests/${requestId}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Accept failed: ${response.status}`);
  }
};

/**
 * Decline a follow request
 */
export const declineFollowRequest = async (requestId: string): Promise<void> => {
  const response = await apiRequest(`/follow/api/requests/${requestId}/decline`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Decline failed: ${response.status}`);
  }
};

/**
 * Check follow request status: "pending" if request exists, "none" otherwise
 */
export const checkFollowRequestStatus = async (
  requesterSubId: string,
  followeeSubId: string
): Promise<"pending" | "none"> => {
  const params = new URLSearchParams({
    requester: requesterSubId,
    followee: followeeSubId,
  });
  const response = await apiRequest(`/follow/api/request-status?${params}`, {
    method: "GET",
  });
  const data = await parseJsonResponse<any>(response);
  const status = (data?.status ?? data ?? "").toString().toLowerCase();
  return status === "pending" ? "pending" : "none";
};
