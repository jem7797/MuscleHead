import React, { Children, createContext, useContext, useState, ReactNode } from 'react'

interface UserContextType {
  given_name: string;
  setgiven_name: (name: string) => void;
  setTempPasswordForSignup: (password: string) => void;
  getAndClearTempPassword: () => string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {children: ReactNode}) => {
      const [given_name, setgiven_name] = useState("");
      // Temporary password storage for signup flow - cleared after one-time use
      const [tempPassword, setTempPassword] = useState<string | null>(null);
    
      // Store password temporarily (only during signup flow)
      const setTempPasswordForSignup = (password: string) => {
        setTempPassword(password);
      };
    
      // Get password and clear it immediately (one-time use only)
      const getAndClearTempPassword = (): string | null => {
        const password = tempPassword;
        setTempPassword(null); // Clear immediately after retrieval
        return password;
      };
    
      return(
        <UserContext.Provider value={{
          given_name, 
          setgiven_name,
          setTempPasswordForSignup,
          getAndClearTempPassword
        }}>
            {children}
        </UserContext.Provider>
      )
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};