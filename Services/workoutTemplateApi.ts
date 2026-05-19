/**
 * Workout Template API Service
 *
 * This file contains all API functions related to workout template operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse, getCurrentUserSub } from "./apiConfig";

/** Paginated response from GET /workoutTemplate/api */
export interface PaginatedWorkoutTemplatesResponse<T = unknown> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface WorkoutTemplatesPageParams {
  page?: number;
  size?: number;
  sort?: string;
  /** If provided, fetches only user's routines */
  userOnly?: boolean;
}

/**
 * Fetches workout templates (routines) for the current user - legacy endpoint, no pagination
 * GET /workoutTemplate/api/?subId={subId}
 */
export const getWorkoutTemplates = async (): Promise<any[]> => {
  const sub = await getCurrentUserSub();
  if (!sub) {
    throw new Error("Not authenticated");
  }
  const response = await apiRequest(
    `/workoutTemplate/api?subId=${encodeURIComponent(sub)}`,
    { method: "GET" },
  );
  const data = await parseJsonResponse<unknown>(response);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "content" in data && Array.isArray((data as any).content)) {
    return (data as any).content;
  }
  return [];
};

/**
 * @deprecated Use getWorkoutTemplates for legacy (no pagination). Paginated endpoint available when backend supports it.
 * Fetches paginated workout templates (routines)
 * GET /workoutTemplate/api?subId={subId}&page=0&size=10&sort=id,desc (user routines)
 * GET /workoutTemplate/api?page=0&size=10 (all routines)
 * Falls back to legacy endpoint if paginated request returns 500.
 */
export const getWorkoutTemplatesPaginated = async (
  params: WorkoutTemplatesPageParams = {}
): Promise<PaginatedWorkoutTemplatesResponse> => {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const sort = params.sort ?? "id,desc";
  const query = new URLSearchParams({ page: String(page), size: String(size), sort });

  if (params.userOnly) {
    const sub = await getCurrentUserSub();
    if (sub) query.set("subId", sub);
  }

  const emptyResult = (items: unknown[] = []) => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size,
    number: page,
    last: true,
    first: true,
    numberOfElements: items.length,
    empty: items.length === 0,
  });

  try {
    const response = await apiRequest(`/workoutTemplate/api?${query.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 500 && params.userOnly) {
        const legacy = await getWorkoutTemplates();
        const start = page * size;
        const content = legacy.slice(start, start + size);
        return {
          content,
          totalElements: legacy.length,
          totalPages: Math.ceil(legacy.length / size) || 1,
          size,
          number: page,
          last: start + content.length >= legacy.length,
          first: page === 0,
          numberOfElements: content.length,
          empty: content.length === 0,
        };
      }
      await parseJsonResponse(response);
    }

    const data = await parseJsonResponse<PaginatedWorkoutTemplatesResponse>(response);

    if (data && typeof data === "object" && Array.isArray(data.content)) {
      return {
        content: data.content,
        totalElements: data.totalElements ?? data.content.length,
        totalPages: data.totalPages ?? 1,
        size: data.size ?? size,
        number: data.number ?? page,
        last: data.last ?? true,
        first: data.first ?? true,
        numberOfElements: data.numberOfElements ?? data.content.length,
        empty: data.empty ?? false,
      };
    }
    return emptyResult();
  } catch (e) {
    if (params.userOnly) {
      try {
        const legacy = await getWorkoutTemplates();
        const start = page * size;
        const content = legacy.slice(start, start + size);
        return {
          content,
          totalElements: legacy.length,
          totalPages: Math.ceil(legacy.length / size) || 1,
          size,
          number: page,
          last: start + content.length >= legacy.length,
          first: page === 0,
          numberOfElements: content.length,
          empty: content.length === 0,
        };
      } catch {
        return emptyResult();
      }
    }
    return emptyResult();
  }
};

/**
 * Response shape from GET /workoutTemplate/api/{id}
 * Backend may return either routineExercises (with nested exercise) or exercises (flat).
 */
export interface RoutineExerciseDetail {
  id?: number;
  exerciseId?: number;
  exercise?: {
    id: number;
    name: string;
    areaOfActivation: string;
  };
  orderIndex: number;
  reps: number;
  sets: number;
}

export interface WorkoutTemplateDetail {
  id: number;
  name: string;
  sets?: number;
  routineExercises?: RoutineExerciseDetail[];
  exercises?: { exerciseId: number; orderIndex: number; reps: number; sets?: number }[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetches a single workout template by ID (includes routineExercises with exercise names)
 */
export const getWorkoutTemplateById = async (
  id: number
): Promise<WorkoutTemplateDetail> => {
  const response = await apiRequest(`/workoutTemplate/api/${id}`, {
    method: "GET",
  });
  return parseJsonResponse<WorkoutTemplateDetail>(response);
};

/**
 * Exercise payload for creating a workout template.
 * Backend expects: exerciseId, orderIndex, reps, and optionally sets (uses template default if omitted).
 */
export interface CreateTemplateExercise {
  exerciseId: number;
  orderIndex: number;
  reps: number;
  sets?: number;
}

/**
 * Creates a new workout template in the backend.
 * Backend expects: { name, sets, exercises: [{ exerciseId, orderIndex, reps, sets? }] }
 */
export const createWorkoutTemplate = async (
  name: string,
  defaultSets: number,
  exercises: CreateTemplateExercise[]
): Promise<any> => {
  const requestBody = {
    name,
    sets: defaultSets,
    exercises: exercises.map(({ exerciseId, orderIndex, reps, sets }) => {
      const ex: { exerciseId: number; orderIndex: number; reps: number; sets?: number } = {
        exerciseId,
        orderIndex,
        reps,
      };
      if (sets != null && sets > 0) {
        ex.sets = sets;
      }
      return ex;
    }),
  };

  const response = await apiRequest(
    "/workoutTemplate/api/",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Updates an existing workout template in the backend
 * 
 * @param templateId - The ID of the workout template to update
 * @param updateData - Object containing fields to update (name, movements, etc.)
 * @returns Promise with updated workout template data
 */
export const updateWorkoutTemplate = async (
  templateId: number | string,
  updateData: {
    name?: string;
    sets?: number;
    exercises?: { exerciseId: number; orderIndex: number; reps: number; sets?: number }[];
  }
): Promise<any> => {
  const requestBody = JSON.stringify(updateData);

  const response = await apiRequest(
    `/workout-template/api/${templateId}`,
    {
      method: "PUT",
      body: requestBody,
    },
    false
  );

  return parseJsonResponse(response);
};

/**
 * Deletes a workout template from the backend
 * 
 * @param templateId - The ID of the workout template to delete
 * @returns Promise with deletion confirmation
 */
export const deleteWorkoutTemplate = async (
  templateId: number | string
): Promise<any> => {
  const response = await apiRequest(
    `/workoutTemplate/api/${templateId}`,
    {
      method: "DELETE",
    },
    false
  );

  if (!response.ok) {
    await parseJsonResponse(response);
    return;
  }
  const text = await response.text();
  if (!text || text.trim() === "") {
    return { success: true };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { success: true };
  }
};
