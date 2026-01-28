import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUserSub } from '../Services/apiConfig';

interface UserContextType {
  // Auth state
  given_name: string;
  isAuthenticated: boolean;
  userId: string;
  isLoading: boolean; // Auth loading state

  // Profile state
  username: string;
  showRealName: boolean;
  level: string;
  xpBars: number;
  pfpLink: string | undefined;
  isProfileLoading: boolean; // Profile data loading state 




  setgiven_name: (name: string) => void;
  setTempPasswordForSignup: (password: string) => void;
  getAndClearTempPassword: () => string | null;
  setIsAuth: (isAuthBoolValue: boolean) => void;
  getAndSetUserSubId: () => Promise<void>;

  // Profile methods
  changeUsername: (newUsername: string) => void;
  setShowRealNameValue: (revealName: boolean) => void;
  setProfileLoading: (loadStatus: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {children: ReactNode}) => {
      // Auth state
      const [given_name, setgiven_name] = useState("");
      const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
      const [userId, setUserId] = useState("");
      const [isLoading, setIsLoading] = useState<boolean>(true);

      // Profile state
      const [username, setUsername] = useState<string>(" ");
      const [showRealName, setShowRealName] = useState<boolean>(false);
      const [level, setLevel] = useState<string>(" ");
      const [xpBars, setXpBars] = useState<number>(0);
      const [pfpLink, setPfpLink] = useState<string | undefined>();
      const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

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

   
      const setIsAuth = (isAuthBoolValue: boolean) => {
          setIsAuthenticated(isAuthBoolValue);
      };


      const getAndSetUserSubId = async() => {
        setIsLoading(true);
        try{
        const userSub = await getCurrentUserSub();
        
        if(userSub){
          setUserId(userSub);
          setIsAuth(true);
        }else{
          setUserId("");
          setIsAuth(false);
        }
      }catch(error){
        console.log("Error getting Sub: ", error);
        setUserId("");
        setIsAuth(false);
      }finally{
        setIsLoading(false);
      }
      }

      // Profile methods
      const changeUsername = (newUsername: string) => {
        setUsername(newUsername);
      }

      const setShowRealNameValue = (revealNameStatus: boolean) => {
        setShowRealName(revealNameStatus);
      }

     

      const setProfileLoading = (loadStatus: boolean) => {
        setIsProfileLoading(loadStatus);
      }

      // Check auth status on mount
      useEffect(() => {
        getAndSetUserSubId();
      }, []); // Empty array = runs once on mount

      // Re-check when user becomes authenticated (if userId is missing)
      useEffect(() => {
        if (isAuthenticated && !userId) {
          // Only re-check if authenticated but userId is missing
          getAndSetUserSubId();
        }
      }, [isAuthenticated, userId]); // Re-run when isAuthenticated or userId changes

    
      return(
        <UserContext.Provider value={{
          // Auth state
          given_name,
          isAuthenticated,
          userId,
          isLoading,
          // Profile state
          username,
          showRealName,
          level,
          xpBars,
          pfpLink,
          isProfileLoading,
          // Auth methods
          setgiven_name,
          setTempPasswordForSignup,
          getAndClearTempPassword,
          setIsAuth,
          getAndSetUserSubId,
          // Profile methods
          changeUsername,
          setShowRealNameValue,
          setProfileLoading
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