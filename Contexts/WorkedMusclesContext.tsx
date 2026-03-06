import React, { createContext, useContext } from "react";
import { WorkedMuscleEntry } from "../Services/workedMusclesApi";

type WorkedMusclesContextValue = {
  frontWorked?: WorkedMuscleEntry[] | string[];
  backWorked?: WorkedMuscleEntry[] | string[];
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


