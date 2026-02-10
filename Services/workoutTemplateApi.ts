/**
 * Workout Template API Service
 * 
 * This file contains all API functions related to workout template operations.
 * It uses the apiConfig utilities to make requests to the backend.
 */

import { apiRequest, parseJsonResponse } from "./apiConfig";

/**
 * Creates a new workout template in the backend.
 * Matches WorkoutTemplateRequest: name + exercises (List<ExerciseInstanceRequest>).
 */
export const createWorkoutTemplate = async (
  name: string,
  exercises: { exerciseId: number; orderIndex: number; targetReps: number; targetSets: number }[]
): Promise<any> => {
  const requestBody = {
    name,
    exercises,
  };

  const response = await apiRequest(
    "/workoutTemplate/api/",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    }
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
    exercises?: { exerciseId: number; orderIndex: number; targetReps: number; targetSets: number }[];
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
    `/workout-template/api/${templateId}`,
    {
      method: "DELETE",
    },
    false
  );

  return parseJsonResponse(response);
};
