/**
 * Server-authoritative live session timer helpers.
 * Elapsed time comes from GET /api/live-sessions/{sessionId} (timer object).
 */

export type LiveSessionTimerState = "STOPPED" | "RUNNING" | "PAUSED";

export interface LiveSessionTimer {
  elapsedSeconds: number;
  timerState: LiveSessionTimerState;
  serverTime: string;
}

/** Snapshot taken when a timer payload is received from the API. */
export interface LiveSessionTimerSnapshot {
  elapsedSeconds: number;
  timerState: LiveSessionTimerState;
  serverTimeMs: number;
  receivedAtMs: number;
}

const parseTimerState = (value: unknown): LiveSessionTimerState => {
  const upper = String(value ?? "STOPPED").toUpperCase();
  if (upper === "RUNNING" || upper === "PAUSED" || upper === "STOPPED") {
    return upper;
  }
  return "STOPPED";
};

export const normalizeLiveSessionTimer = (
  raw: unknown,
): LiveSessionTimerSnapshot | null => {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const elapsedRaw = row.elapsedSeconds ?? row.elapsed_seconds;
  const elapsed = Number(elapsedRaw);
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;

  const serverTimeRaw = row.serverTime ?? row.server_time;
  const serverTimeMs = Date.parse(String(serverTimeRaw ?? ""));
  if (!Number.isFinite(serverTimeMs)) return null;

  return {
    elapsedSeconds: Math.floor(elapsed),
    timerState: parseTimerState(row.timerState ?? row.timer_state),
    serverTimeMs,
    receivedAtMs: Date.now(),
  };
};

/**
 * Projects elapsed seconds from the last server snapshot.
 * When RUNNING, advances time using server clock offset (not a local workout clock).
 */
export const computeLiveTimerDisplaySeconds = (
  snapshot: LiveSessionTimerSnapshot,
): number => {
  if (snapshot.timerState !== "RUNNING") {
    return snapshot.elapsedSeconds;
  }

  const clockOffsetMs = snapshot.serverTimeMs - snapshot.receivedAtMs;
  const nowServerMs = Date.now() + clockOffsetMs;
  const extraSeconds = Math.max(
    0,
    Math.floor((nowServerMs - snapshot.serverTimeMs) / 1000),
  );
  return snapshot.elapsedSeconds + extraSeconds;
};

/**
 * Builds a timer payload from live_workout_sessions row columns (Supabase realtime).
 * Matches backend fields: timerState, timerStartedAt, timerElapsedSeconds.
 */
export const buildTimerPayloadFromSessionRow = (
  row: Record<string, unknown>,
): LiveSessionTimer | null => {
  const timerState = parseTimerState(row.timer_state ?? row.timerState);
  const accumulatedRaw = row.timer_elapsed_seconds ?? row.timerElapsedSeconds;
  const accumulated = Number(accumulatedRaw ?? 0);
  if (!Number.isFinite(accumulated) || accumulated < 0) return null;

  let elapsedSeconds = Math.floor(accumulated);
  const startedAtRaw = row.timer_started_at ?? row.timerStartedAt;

  if (timerState === "RUNNING" && startedAtRaw) {
    const startMs = Date.parse(String(startedAtRaw));
    if (Number.isFinite(startMs)) {
      elapsedSeconds += Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    }
  }

  return {
    elapsedSeconds,
    timerState,
    serverTime: new Date().toISOString(),
  };
};

export const applyTimerFromSessionRow = (
  row: unknown,
  applyTimer: (timer: unknown) => void,
): boolean => {
  if (!row || typeof row !== "object") return false;
  const payload = buildTimerPayloadFromSessionRow(row as Record<string, unknown>);
  if (!payload) return false;
  applyTimer(payload);
  return true;
};
