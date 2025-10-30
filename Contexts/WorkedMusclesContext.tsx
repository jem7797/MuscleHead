import React, { createContext, useContext } from "react";

type WorkedMusclesContextValue = {
  frontWorked?: string[];
  backWorked?: string[];
};

const WorkedMusclesContext = createContext<WorkedMusclesContextValue | undefined>(undefined);

type WorkedMusclesProviderProps = WorkedMusclesContextValue & {
  children: React.ReactNode;
};

export const WorkedMusclesProvider: React.FC<WorkedMusclesProviderProps> = ({
  frontWorked,
  backWorked,
  children,
}) => {
  return (
    <WorkedMusclesContext.Provider value={{ frontWorked, backWorked }}>
      {children}
    </WorkedMusclesContext.Provider>
  );
};

export function useWorkedMuscles(): WorkedMusclesContextValue {
  const ctx = useContext(WorkedMusclesContext);
  return ctx ?? {};
}


