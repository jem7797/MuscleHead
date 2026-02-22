/**
 * Follow API Service
 *
 * POST   follow/api/follow/{followeeSubId}   - Current user follows followeeSubId
 * DELETE follow/api/unfollow/{followeeSubId}  - Current user unfollows followeeSubId
 * GET    follow/api/followers/{subId}         - Followers of subId
 * GET    follow/api/following/{subId}         - Users that subId follows
 * GET    follow/api/check?follower=...&followee=... - Whether follower follows followee
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

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
