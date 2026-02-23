import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { signOut } from 'aws-amplify/auth';
import { getCurrentUserSub } from '../Services/apiConfig';
import { getUser, getCurrentUserProfile, updateUser } from '../Services/userApi';
import { getNameForRank } from '../rankMapping';
import { setNemesisSubIds as persistNemesisSubIds, clearNemesisSubIds } from '../Services/nemesisStorage';




interface Rank{
  id: number,
  level: number,
  name: string,
}



interface UserContextType {
  // Auth state
  given_name: string;
  email: string;
  birth_year: number | null;
  isAuthenticated: boolean;
  userId: string;
  isLoading: boolean; // Auth loading state
  // Profile state
  username: string;
  bio: string;
  showRealName: boolean;
  height: number | null;
  weight: number |  null;
  lifetimeWeightLifted: number | null;
  lifetimeGymTime: number | null;
  /** Add to lifetime stats after a workout (no refetch). Weight in lbs, time in minutes. Optimistically updates xp (+1) and rank if leveled up. */
  addToLifetimeStats: (weightLbs: number, timeMinutes: number, xpGain?: number) => void;
  /** Optimistically update following count. delta: +1 for follow, -1 for unfollow. */
  addToFollowingCount: (delta: number) => void;
  isNatty: boolean | true;
  xp: number;
  rank: Rank | null,
  numberOfFollowers: number | undefined,
  numberFollowing: number | undefined,
  numberOfPosts: number | undefined,
  pfpLink: string | undefined;
  isProfileLoading: boolean; // Profile data loading state
  nemesisSubIds: string[];
  setNemesisSubIds: (ids: string[] | ((prev: string[]) => string[])) => void;




  setgiven_name: (name: string) => void;
  setTempPasswordForSignup: (password: string) => void;
  getAndClearTempPassword: () => string | null;
  setIsAuth: (isAuthBoolValue: boolean) => void;
  getAndSetUserSubId: () => Promise<void>;
  refreshUserProfile: (sub?: string) => Promise<void>;

  // Profile methods
  changeUsername: (newUsername: string) => void;
  updateProfile: (updates: { username?: string; bio?: string; height?: number | null; weight?: number | null; nattyStatus?: boolean; profilePicUrl?: string }) => Promise<void>;
  setShowRealNameValue: (revealName: boolean) => void;
  setProfileLoading: (loadStatus: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {children: ReactNode}) => {
      // Auth state
      const [given_name, setgiven_name] = useState("");
      const [email, setEmail] = useState("");
      const [birth_year, setBirthYear] = useState<number | null>(null);
      const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
      const [userId, setUserId] = useState("");
      const [isLoading, setIsLoading] = useState<boolean>(true);

      // Profile state
      const [username, setUsername] = useState<string>(" ");
      const [bio, setBio] = useState<string>("");
      const [showRealName, setShowRealName] = useState<boolean>(false);
      const [height, setHeight] = useState<number | null>();
      const [weight, setWeight] = useState<number | null>();
      const [lifetimeWeightLifted, setLifetimeWeightLifted] = useState<number>();
      const [lifetimeGymTime, setLifetimeGymTime] = useState<number>();
      const [isNatty, setIsNatty ] = useState<boolean>();
      const [xp, setXp] = useState<number>(0);
      const [rank, setRank] = useState<Rank | null>();
      const [numberOfFollowers, setNumberOfFollowers] = useState<number>();
      const [numberFollowing, setNumberFollowing] = useState<number>();
      const [numberOfPosts, setNumberOfPosts] = useState<number>();
      const [pfpLink, setPfpLink] = useState<string | undefined>();
      const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
      const [nemesisSubIds, setNemesisSubIdsInternal] = useState<string[]>([]);

      const setNemesisSubIds = useCallback((idsOrUpdater: string[] | ((prev: string[]) => string[])) => {
        setNemesisSubIdsInternal((prev) => {
          const next = typeof idsOrUpdater === "function" ? idsOrUpdater(prev) : idsOrUpdater;
          persistNemesisSubIds(next).catch(() => {});
          return next;
        });
      }, []);

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


      const clearProfile = () => {
        setUsername(" ");
        setBio("");
        setEmail("");
        setBirthYear(null);
        setHeight(undefined);
        setWeight(undefined);
        setLifetimeWeightLifted(undefined);
        setLifetimeGymTime(undefined);
        setIsNatty(undefined);
        setXp(0);
        setRank(null);
    setNumberOfFollowers(undefined);
    setNumberFollowing(undefined);
    setNumberOfPosts(undefined);
    setPfpLink(undefined);
    setNemesisSubIdsInternal([]);
    clearNemesisSubIds().catch(() => {});
      };

      const getAndSetUserSubId = async() => {
        setIsLoading(true);
        try{
        const userSub = await getCurrentUserSub();
        
        if(userSub){
          setUserId(userSub);
          setIsAuth(true);
          clearProfile(); // Don't show previous user's profile until we fetch the new one
        }else{
          setUserId("");
          setIsAuth(false);
          clearProfile();
        }
      }catch(error){
        console.log("Error getting Sub: ", error);
        setUserId("");
        setIsAuth(false);
        clearProfile();
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

      const updateProfile = async (updates: { username?: string; bio?: string; height?: number | null; weight?: number | null; nattyStatus?: boolean; profilePicUrl?: string }) => {
        if (!userId) return;
        // PATCH: send only the fields being changed
        const payload: Record<string, unknown> = {};
        if (updates.username !== undefined && updates.username.trim()) payload.username = updates.username.trim();
        if (updates.bio !== undefined) payload.bio = updates.bio;
        if (updates.height !== undefined) payload.height = updates.height;
        if (updates.weight !== undefined) payload.weight = updates.weight;
        if (updates.nattyStatus !== undefined) payload.natty_status = updates.nattyStatus;
        if (updates.profilePicUrl !== undefined) payload.profilePicUrl = updates.profilePicUrl;
        const hasProfileUpdates = updates.username !== undefined || updates.bio !== undefined ||
          updates.height !== undefined || updates.weight !== undefined || updates.nattyStatus !== undefined || updates.profilePicUrl !== undefined;
        if (!hasProfileUpdates) return;
        await updateUser(userId, payload);
        if (updates.username !== undefined) setUsername(updates.username);
        if (updates.bio !== undefined) setBio(updates.bio);
        if (updates.height !== undefined) setHeight(updates.height);
        if (updates.weight !== undefined) setWeight(updates.weight);
        if (updates.nattyStatus !== undefined) setIsNatty(updates.nattyStatus);
        if (updates.profilePicUrl !== undefined) setPfpLink(updates.profilePicUrl);
      }

     

      const setProfileLoading = (loadStatus: boolean) => {
        setIsProfileLoading(loadStatus);
      }

      const XP_PER_LEVEL = 5;

      const addToLifetimeStats = (weightLbs: number, timeMinutes: number, xpGain: number = 1) => {
        setLifetimeWeightLifted((prev) => (prev ?? 0) + weightLbs);
        setLifetimeGymTime((prev) => (prev ?? 0) + Math.floor(timeMinutes));
        setXp((prev) => {
          const currentXp = prev ?? 0;
          const newXp = currentXp + xpGain;
          const currentLevel = Math.floor(currentXp / XP_PER_LEVEL) + 1;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          if (newLevel > currentLevel) {
            setRank({ id: newLevel, level: newLevel, name: getNameForRank(newLevel) });
          }
          return newXp;
        });
      }

      const addToFollowingCount = (delta: number) => {
        setNumberFollowing((prev) => Math.max(0, (prev ?? 0) + delta));
      }



const fetchUserProfile = async (sub?: string) => {
  const id = sub ?? userId;
  if (!id) return;
  setProfileLoading(true);
  try {
    const userData = id === userId ? await getCurrentUserProfile() : await getUser(id);
    setUsername(userData.username ?? " ");
    setBio(userData.bio ?? "");
    setgiven_name(userData.first_name ?? userData.given_name ?? "");
    setEmail(userData.email ?? "");
    setBirthYear(userData.birth_year ?? null);
    setHeight(userData.height ?? null);
    setWeight(userData.weight ?? null);
    setLifetimeWeightLifted(userData.lifetime_weight_lifted);
    setLifetimeGymTime(userData.lifetime_gym_time);
    setIsNatty(userData.nattyStatus);
    setXp(userData.xp ?? 0);
    setRank(userData.rank);
    setNumberOfFollowers(userData.number_of_followers);
    setNumberFollowing(userData.number_following);
    setNumberOfPosts(userData.number_of_posts);
    const nemesisRaw = userData.nemesis ?? userData.nemesisSubIds ?? userData.nemesis_sub_ids ?? [];
    const ids = Array.isArray(nemesisRaw)
      ? nemesisRaw.map((item: unknown) => (typeof item === "string" ? item : (item as { subId?: string })?.subId ?? "")).filter(Boolean)
      : [];
    setNemesisSubIdsInternal(ids);
    persistNemesisSubIds(ids).catch(() => {});
    const raw = userData.profile_pic_url ?? userData.profilePicUrl ?? userData.pfp_link;
    setPfpLink(raw ? (raw.startsWith("http") ? raw : `https://${raw}`) : undefined);
  } catch (error: any) {
    console.log("Failed to fetch user profile:", id);
    if (error?.status === 403) {
      await signOut();
      setUserId("");
      setIsAuthenticated(false);
      clearProfile();
    }
  } finally {
    setProfileLoading(false);
  }
};

      // Check auth status on mount
      useEffect(() => {
        getAndSetUserSubId();
      }, []); // Empty array = runs once on mount

      useEffect(() => {
        if (isAuthenticated && !userId) {
          getAndSetUserSubId();
        }
      }, [isAuthenticated, userId]); // Re-run when isAuthenticated or userId changes

     
    useEffect(() => {
      if (isAuthenticated && userId) {
        fetchUserProfile(userId);
      }
    }, [isAuthenticated, userId]);



      return(
        <UserContext.Provider value={{
          // Auth state
          given_name,
          email,
          birth_year,
          isAuthenticated,
          userId,
          isLoading,
          // Profile state
          username,
          bio,
          showRealName,
          height: height ?? null,
          weight: weight ?? null,
          lifetimeWeightLifted: lifetimeWeightLifted ?? null,
          lifetimeGymTime: lifetimeGymTime ?? null,
          addToLifetimeStats,
          addToFollowingCount,
          isNatty: isNatty ?? true,
          
          xp,
          rank: rank ?? null, 
          numberOfFollowers,
          numberFollowing,
          numberOfPosts,
          pfpLink,
          isProfileLoading,
          nemesisSubIds,
          setNemesisSubIds,

          // Auth methods
          setgiven_name,
          setTempPasswordForSignup,
          getAndClearTempPassword,
          setIsAuth,
          getAndSetUserSubId,
          refreshUserProfile: fetchUserProfile,

          // Profile methods
          changeUsername,
          updateProfile,
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

