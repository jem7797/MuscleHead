/**
 * Worked Muscles API Service
 *
 * GET /workedMuscles/api/{userId} - Fetch user's worked muscles
 * POST /workedMuscles/api/ - Update worked muscles from a completed workout
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

export interface WorkedMusclesResponse {
  frontWorked: string[];
  backWorked: string[];
}

export interface WorkedMusclesPostExercise {
  exerciseId: number;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkedMusclesPostBody {
  userId: string;
  exercises: WorkedMusclesPostExercise[];
}

/**
 * Fetches worked muscles for the current user.
 * Returns { frontWorked: [], backWorked: [] } when no data exists or on error.
 */
export const getWorkedMuscles = async (
  userId: string
): Promise<WorkedMusclesResponse> => {
  if (!userId) return { frontWorked: [], backWorked: [] };
  try {
    const response = await apiRequest(`/workedMuscles/api/${userId}`, {
      method: "GET",
    });
    const data = await parseJsonResponse<WorkedMusclesResponse>(response);
    console.log("[workedMuscles] GET raw response:", JSON.stringify(data));
    return {
      frontWorked: Array.isArray(data?.frontWorked) ? data.frontWorked : [],
      backWorked: Array.isArray(data?.backWorked) ? data.backWorked : [],
    };
  } catch (err) {
    console.error("error in getworked muscles", err)
    return { frontWorked: [], backWorked: [] };
  }
};

/**
 * Posts worked muscles from a completed workout.
 * Returns 204 No Content. Logs errors silently on failure.
 */
export const postWorkedMuscles = async (
  exercises: WorkedMusclesPostExercise[]
): Promise<void> => {
  const userId = await getCurrentUserSub();
  if (!userId || exercises.length === 0) return;
  try {
    // Strip to only { exerciseId, sets, reps, weight } - no notes or extra fields
    const payload: WorkedMusclesPostBody = {
      userId,
      exercises: exercises.map(({ exerciseId, sets, reps, weight }) => ({
        exerciseId,
        sets,
        reps,
        weight,
      })),
    };
    const response = await apiRequest(
      "/workedMuscles/api/",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false // Don't add sub - backend expects only userId in body
    );
    if (!response.ok) {
      const errBody = await response.text();
      console.warn("[workedMuscles] POST failed:", response.status, errBody);
    }
  } catch (e) {
    console.warn("[workedMuscles] POST error:", e);
  }
};
