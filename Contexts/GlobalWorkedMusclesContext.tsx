import React, { createContext, useContext, useState } from 'react';

interface GlobalWorkedMusclesContextType {
  globalFrontWorked: string[];
  globalBackWorked: string[];
  setGlobalFrontWorked: (muscles: string[]) => void;
  setGlobalBackWorked: (muscles: string[]) => void;
}

const GlobalWorkedMusclesContext = createContext<GlobalWorkedMusclesContextType | undefined>(undefined);

export const GlobalWorkedMusclesProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalFrontWorked, setGlobalFrontWorked] = useState<string[]>([]);
  const [globalBackWorked, setGlobalBackWorked] = useState<string[]>([]);

  return (
    <GlobalWorkedMusclesContext.Provider value={{ globalFrontWorked, globalBackWorked, setGlobalFrontWorked, setGlobalBackWorked }}>
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

