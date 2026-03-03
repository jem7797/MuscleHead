/**
 * Workout Schedule API Service
 *
 * Manages the user's weekly workout schedule (Push, Pull, Legs, etc. per day).
 * User is taken from JWT.
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

/** day_of_the_week: 1=Monday, 7=Sunday */
export interface WorkoutScheduleEntry {
  id: number;
  day_of_the_week: number;
  label: string;
}

/** Map day name to backend day_of_the_week (1=Mon, 7=Sun) */
export const DAY_TO_NUMBER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export const DAY_KEYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const NUMBER_TO_DAY: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

/**
 * Fetches the user's workout schedule.
 * GET /workoutSchedule/api/user/{subId} - returns array of schedule entries for the user.
 * Returns empty array if not authenticated or request fails.
 */
export const getWorkoutSchedules = async (): Promise<WorkoutScheduleEntry[]> => {
  try {
    const sub = await getCurrentUserSub();
    if (!sub) return [];
    const response = await apiRequest(`/workoutSchedule/api/user/${sub}`, { method: "GET" }, false);
    const data = await parseJsonResponse<WorkoutScheduleEntry[]>(response);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/** Converts API entries to Record<dayName, label> for the UI */
export const entriesToSchedule = (entries: WorkoutScheduleEntry[]): Record<string, string> => {
  const schedule: Record<string, string> = {
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  };
  entries.forEach((e) => {
    const day = NUMBER_TO_DAY[e.day_of_the_week];
    if (day) schedule[day] = e.label ?? "";
  });
  return schedule;
};

/**
 * Creates a new schedule entry.
 * POST /workoutSchedule/api/
 * label is optional; defaults to "" on backend.
 */
export const createWorkoutSchedule = async (
  day_of_the_week: number,
  label?: string
): Promise<WorkoutScheduleEntry> => {
  const body: { day_of_the_week: number; label?: string } = { day_of_the_week };
  if (label != null && label !== "") body.label = label;
  const response = await apiRequest(
    "/workoutSchedule/api/",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    false
  );
  return parseJsonResponse<WorkoutScheduleEntry>(response);
};

/**
 * Partially updates an existing schedule entry.
 * PATCH /workoutSchedule/api/{id}
 */
export const updateWorkoutSchedule = async (
  id: number,
  updates: { day_of_the_week?: number; label?: string }
): Promise<WorkoutScheduleEntry> => {
  const response = await apiRequest(
    `/workoutSchedule/api/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
    false
  );
  return parseJsonResponse<WorkoutScheduleEntry>(response);
};
