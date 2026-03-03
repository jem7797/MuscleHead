import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Exercise interface matching backend expectations for workout template creation
 * Backend expects: exerciseId, orderIndex, reps, and optionally sets
 */
interface TemplateExercise {
  exerciseId: number;
  orderIndex: number;
  reps: number;
  sets: number;
}

/**
 * WorkoutTemplateState interface matching backend API structure
 * Backend expects: { name, sets, exercises: [{ exerciseId, orderIndex, reps, sets? }] }
 */
interface WorkoutTemplateState {
  name: string;
  sets: number;
  exercises: TemplateExercise[];
}

/**
 * Context type providing state and functions to manage workout template creation
 */
interface WorkoutTemplateContextType {
  state: WorkoutTemplateState;
  setState: (state: WorkoutTemplateState) => void;
  setName: (name: string) => void;
  setDefaultSets: (sets: number) => void;
  setExercises: (exercises: TemplateExercise[]) => void;
  addExercise: (exercise: TemplateExercise) => void;
  removeExercise: (orderIndex: number) => void;
  updateExercise: (orderIndex: number, exercise: Partial<TemplateExercise>) => void;
  resetState: () => void;
}

const WorkoutTemplateContext = createContext<WorkoutTemplateContextType | undefined>(undefined);

/**
 * WorkoutTemplateProvider - Manages state for creating workout templates
 * 
 * This context manages the state structure expected by the backend API:
 * {
 *   name: "My Workout Template",
 *   sets: 3,
 *   exercises: [
 *     { exerciseId: 1, orderIndex: 0, reps: 12, sets: 3 }
 *   ]
 * }
 */
export const WorkoutTemplateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WorkoutTemplateState>({
    name: '',
    sets: 3,
    exercises: [],
  });

  const setName = (name: string) => {
    setState((prev) => ({ ...prev, name }));
  };

  const setExercises = (exercises: TemplateExercise[]) => {
    setState((prev) => ({ ...prev, exercises }));
  };

  const addExercise = (exercise: TemplateExercise) => {
    setState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, exercise],
    }));
  };

  const removeExercise = (orderIndex: number) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises
        .filter((ex) => ex.orderIndex !== orderIndex)
        .map((ex, index) => ({ ...ex, orderIndex: index })), // Re-index after removal
    }));
  };

  const updateExercise = (orderIndex: number, updates: Partial<TemplateExercise>) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.orderIndex === orderIndex ? { ...ex, ...updates } : ex
      ),
    }));
  };

  const setDefaultSets = (sets: number) => {
    setState((prev) => ({ ...prev, sets }));
  };

  const resetState = () => {
    setState({
      name: '',
      sets: 3,
      exercises: [],
    });
  };

  return (
    <WorkoutTemplateContext.Provider
      value={{
        state,
        setState,
        setName,
        setDefaultSets,
        setExercises,
        addExercise,
        removeExercise,
        updateExercise,
        resetState,
      }}
    >
      {children}
    </WorkoutTemplateContext.Provider>
  );
};

/**
 * Custom hook to access WorkoutTemplateContext
 * 
 * @returns WorkoutTemplateContextType - State and functions for managing workout template
 * @throws Error if used outside of WorkoutTemplateProvider
 * 
 * @example
 * const { state, setName, addExercise } = useWorkoutTemplate();
 * setName("Push Day");
 * addExercise({ exerciseId: 1, orderIndex: 0, reps: 12, sets: 3 });
 */
export const useWorkoutTemplate = () => {
  const context = useContext(WorkoutTemplateContext);
  if (context === undefined) {
    throw new Error('useWorkoutTemplate must be used within WorkoutTemplateProvider');
  }
  return context;
};
