import React, { createContext, useContext, useState } from 'react';

interface Set {
  reps: string;
  weight: string;
  setType?: "normal" | "warmup";
}

interface Workout {
  id: number;
  exerciseId: number | null;
  muscleGroup: string | null;
  workout: string | null;
  sets: Set[];
}

interface WorkoutStats {
  workoutName: string;
  workouts: Workout[];
  totalTime: number; // in seconds
  totalWeight: number; // in lbs
  maxLift: number; // in lbs
  maxLiftExercise: string;
}

interface WorkoutStatsContextType {
  stats: WorkoutStats | null;
  setStats: (stats: WorkoutStats | null) => void;
}

const WorkoutStatsContext = createContext<WorkoutStatsContextType | undefined>(undefined);

export const WorkoutStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const [stats, setStats] = useState<WorkoutStats | null>(null);

  return (
    <WorkoutStatsContext.Provider value={{ stats, setStats }}>
      {children}
    </WorkoutStatsContext.Provider>
  );
};

export const useWorkoutStats = () => {
  const context = useContext(WorkoutStatsContext);
  if (!context) {
    throw new Error('useWorkoutStats must be used within WorkoutStatsProvider');
  }
  return context;
};

