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
  session_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: string;
  sent_at: string;
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
  const data = await parseJsonResponse<SessionInvite[] | { invites?: SessionInvite[] }>(response);
  return Array.isArray(data) ? data : (data.invites ?? []);
}
