/**
 * Live workout session REST API.
 * All endpoints require Bearer JWT in Authorization header.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

const BASE = "/api/live-sessions";

export interface LiveWorkoutSession {
  id: string;
  host_user_id: string;
  guest_user_id: string | null;
  host_user_name: string;
  status: string;
  created_at: string;
}

export interface LiveSessionExercise {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number | null;
  logged_at: string;
}

export interface SessionInvite {
  id: string;
  /** Set when API returns snake_case; prefer {@link getSessionInviteId} for URLs. */
  invite_id?: string;
  session_id: string;
  from_user_id: string;
  host_user_name: string;
  to_user_id: string;
  message: string | null;
  status: string;
  sent_at: string;
}

type RawInvite = Record<string, unknown>;

function strFrom(raw: RawInvite, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function normalizeSessionInvite(raw: RawInvite): SessionInvite {
  const id = strFrom(raw, "id", "invite_id", "inviteId");
  let message: string | null = null;
  const m = raw.message;
  if (m != null && typeof m === "string") message = m;

  return {
    id,
    invite_id: strFrom(raw, "invite_id", "inviteId") || undefined,
    session_id: strFrom(raw, "session_id", "sessionId"),
    from_user_id: strFrom(raw, "from_user_id", "fromUserId"),
    host_user_name: strFrom(raw, "host_user_name", "hostUserName") || "Someone",
    to_user_id: strFrom(raw, "to_user_id", "toUserId"),
    message,
    status: String(raw.status ?? "pending").toLowerCase(),
    sent_at: strFrom(raw, "sent_at", "sentAt"),
  };
}

/** Canonical invite id for API paths (accept / decline). */
export function getSessionInviteId(
  invite: Pick<SessionInvite, "id"> & { invite_id?: string },
): string {
  if (typeof invite.id === "string" && invite.id.length > 0) return invite.id;
  if (typeof invite.invite_id === "string" && invite.invite_id.length > 0)
    return invite.invite_id;
  return "";
}

export interface SessionWithExercises extends LiveWorkoutSession {
  exercises?: LiveSessionExercise[];
}

/**
 * POST /api/live-sessions/create
 * Create a session. Host is derived from JWT.
 */
export async function createLiveSession(): Promise<LiveWorkoutSession> {
  const response = await apiRequest(`${BASE}/create`, {
    method: "POST",
    body: JSON.stringify({}),
  }, false);
  return parseJsonResponse<LiveWorkoutSession>(response);
}

/**
 * POST /api/live-sessions/{sessionId}/invite
 * Body: { toUserId, message? }
 * Backend returns 201 with no body.
 */
export async function sendInvite({
  sessionId,
  toUserId,
  message,
}: {
  sessionId: string;
  toUserId: string;
  message?: string;
}): Promise<void> {
  const response = await apiRequest(`${BASE}/${sessionId}/invite`, {
    method: "POST",
    body: JSON.stringify({ toUserId, message: message ?? null }),
  }, false);
  if (__DEV__) console.log("invite sent");

  if (!response.ok) {
    await parseJsonResponse(response);
  }
}

/**
 * POST /api/live-sessions/invites/{inviteId}/accept
 */
export async function acceptInvite({ inviteId }: { inviteId: string }): Promise<void> {
  const response = await apiRequest(`${BASE}/invites/${inviteId}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  }, false);
  if (!response.ok) {
    await parseJsonResponse(response);
  }
}

/**
 * POST /api/live-sessions/invites/{inviteId}/decline
 */
export async function declineInvite({ inviteId }: { inviteId: string }): Promise<void> {
  const response = await apiRequest(`${BASE}/invites/${inviteId}/decline`, {
    method: "POST",
    body: JSON.stringify({}),
  }, false);
  if (!response.ok) {
    await parseJsonResponse(response);
  }
}

/**
 * POST /api/live-sessions/{sessionId}/end
 * Host only.
 */
export async function endSession({ sessionId }: { sessionId: string }): Promise<void> {
  const response = await apiRequest(`${BASE}/${sessionId}/end`, {
    method: "POST",
    body: JSON.stringify({}),
  }, false);
  if (!response.ok) {
    await parseJsonResponse(response);
  }
}

/**
 * GET /api/live-sessions/{sessionId}
 * Returns session details with exercises.
 */
export async function getSession(sessionId: string): Promise<SessionWithExercises> {
  const response = await apiRequest(`${BASE}/${sessionId}`, {}, false);
  return parseJsonResponse<SessionWithExercises>(response);
}

/**
 * GET /api/live-sessions/invites/pending
 * Returns pending invites for current user (from JWT).
 */
export async function getPendingInvites(): Promise<SessionInvite[]> {
  const response = await apiRequest(`${BASE}/invites/pending`, {}, false);
  const data = await parseJsonResponse<RawInvite[] | { invites?: RawInvite[] }>(response);
  const list = Array.isArray(data) ? data : (data.invites ?? []);
  return list.map((row) => normalizeSessionInvite(row));
}
