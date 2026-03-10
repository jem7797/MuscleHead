/**
 * Profile picture URL construction with cache-busting.
 * Backend provides profilePicUrl (S3 key or full URL) and profilePicVersion (timestamp).
 * Append ?v=profilePicVersion to bust CDN and Image cache when user updates their pfp.
 */

import { CLOUDFRONT_BASE_URL } from "../Services/apiConfig";

export interface UserWithProfilePic {
  profile_pic_url?: string | null;
  profilePicUrl?: string | null;
  pfp_link?: string | null;
  profilePicVersion?: number | null;
}

/**
 * Builds the full profile picture URL with cache-busting.
 * @param user - Object with profilePicUrl (or profile_pic_url, pfp_link) and optional profilePicVersion
 * @returns Full URL with ?v=timestamp for cache-busting, or undefined if no profile pic
 */
export function getProfilePicUrl(user: UserWithProfilePic | null | undefined): string | undefined {
  const raw = user?.profile_pic_url ?? user?.profilePicUrl ?? user?.pfp_link;
  if (!raw || typeof raw !== "string") return undefined;

  let baseUrl: string;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    baseUrl = raw;
  } else {
    const domain = CLOUDFRONT_BASE_URL.replace(/\/$/, "");
    baseUrl = `https://${domain}/${raw.replace(/^\//, "")}`;
  }

  const version = user?.profilePicVersion;
  if (!version) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}v=${version}`;
}
