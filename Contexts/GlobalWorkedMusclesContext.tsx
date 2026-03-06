import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { getWorkedMuscles, WorkedMuscleEntry } from '../Services/workedMusclesApi';

interface GlobalWorkedMusclesContextType {
  globalFrontWorked: WorkedMuscleEntry[];
  globalBackWorked: WorkedMuscleEntry[];
  refreshWorkedMuscles: () => Promise<void>;
  isLoadingWorkedMuscles: boolean;
}

const GlobalWorkedMusclesContext = createContext<GlobalWorkedMusclesContextType | undefined>(undefined);

export const GlobalWorkedMusclesProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId, isAuthenticated } = useUser();
  const [globalFrontWorked, setGlobalFrontWorked] = useState<WorkedMuscleEntry[]>([]);
  const [globalBackWorked, setGlobalBackWorked] = useState<WorkedMuscleEntry[]>([]);
  const [isLoadingWorkedMuscles, setIsLoadingWorkedMuscles] = useState(false);

  const refreshWorkedMuscles = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      setGlobalFrontWorked([]);
      setGlobalBackWorked([]);
      return;
    }
    setIsLoadingWorkedMuscles(true);
    try {
      const data = await getWorkedMuscles(userId);
      setGlobalFrontWorked(data.frontWorked);
      setGlobalBackWorked(data.backWorked);
    } catch {
      setGlobalFrontWorked([]);
      setGlobalBackWorked([]);
    } finally {
      setIsLoadingWorkedMuscles(false);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      refreshWorkedMuscles();
    } else {
      setGlobalFrontWorked([]);
      setGlobalBackWorked([]);
    }
  }, [isAuthenticated, userId, refreshWorkedMuscles]);

  return (
    <GlobalWorkedMusclesContext.Provider
      value={{
        globalFrontWorked,
        globalBackWorked,
        refreshWorkedMuscles,
        isLoadingWorkedMuscles,
      }}
    >
      {children}
    </GlobalWorkedMusclesContext.Provider>
  );
};

export const useGlobalWorkedMuscles = () => {
  const context = useContext(GlobalWorkedMusclesContext);
  if (!context) {
    throw new Error('useGlobalWorkedMuscles must be used within GlobalWorkedMusclesProvider');
  }
  return context;
};

