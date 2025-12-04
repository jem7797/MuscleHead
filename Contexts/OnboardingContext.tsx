import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
  gender: string | null;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  privacy_setting: string | null;
  show_weight: boolean | null;
  show_height: boolean | null;
  stat_tracking: boolean | null;
  isNatty: boolean | null;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  setGender: (gender: string | null) => void;
  setHeight: (feet: number, inches: number) => void;
  setWeight: (weight: number) => void;
  setPrivacySetting: (privacy: string | null) => void;
  setShowWeight: (show: boolean) => void;
  setShowHeight: (show: boolean) => void;
  setStatTracking: (tracking: boolean) => void;
  setIsNatty: (natty: boolean) => void;
  resetOnboardingData: () => void;
}

const defaultData: OnboardingData = {
  gender: null,
  heightFeet: null,
  heightInches: null,
  weight: null,
  privacy_setting: null,
  show_weight: null,
  show_height: null,
  stat_tracking: null,
  isNatty: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultData);

  const setGender = (gender: string | null) => {
    setOnboardingData(prev => ({ ...prev, gender }));
  };

  const setHeight = (feet: number, inches: number) => {
    setOnboardingData(prev => ({ ...prev, heightFeet: feet, heightInches: inches }));
  };

  const setWeight = (weight: number) => {
    setOnboardingData(prev => ({ ...prev, weight }));
  };

  const setPrivacySetting = (privacy: string | null) => {
    setOnboardingData(prev => ({ ...prev, privacy_setting: privacy }));
  };

  const setShowWeight = (show: boolean) => {
    setOnboardingData(prev => ({ ...prev, show_weight: show }));
  };

  const setShowHeight = (show: boolean) => {
    setOnboardingData(prev => ({ ...prev, show_height: show }));
  };

  const setStatTracking = (tracking: boolean) => {
    setOnboardingData(prev => ({ ...prev, stat_tracking: tracking }));
  };

  const setIsNatty = (natty: boolean) => {
    setOnboardingData(prev => ({ ...prev, isNatty: natty }));
  };

  const resetOnboardingData = () => {
    setOnboardingData(defaultData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setGender,
        setHeight,
        setWeight,
        setPrivacySetting,
        setShowWeight,
        setShowHeight,
        setStatTracking,
        setIsNatty,
        resetOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
