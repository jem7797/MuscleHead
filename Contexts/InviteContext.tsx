import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { SessionInvite } from "../lib/sessionService";
import { getSessionInviteId } from "../Services/liveSessionApi";

interface InviteContextType {
  inviteQueue: SessionInvite[];
  activeInvite: SessionInvite | null;
  addInvite: (invite: SessionInvite) => void;
  dismissInvite: () => void;
  removeInvite: (inviteId: string) => void;
}

const InviteContext = createContext<InviteContextType | undefined>(undefined);

export const InviteProvider = ({ children }: { children: ReactNode }) => {
  const [inviteQueue, setInviteQueue] = useState<SessionInvite[]>([]);
  const activeInvite = inviteQueue[0] ?? null;

  const addInvite = useCallback((invite: SessionInvite) => {
    const id = getSessionInviteId(invite);
    if (!id) return;
    setInviteQueue((prev) => {
      if (prev.some((i) => getSessionInviteId(i) === id)) return prev;
      return [...prev, invite];
    });
  }, []);

  const dismissInvite = useCallback(() => {
    setInviteQueue((prev) => prev.slice(1));
  }, []);

  const removeInvite = useCallback((inviteId: string) => {
    setInviteQueue((prev) =>
      prev.filter((i) => getSessionInviteId(i) !== inviteId),
    );
  }, []);

  return (
    <InviteContext.Provider
      value={{
        inviteQueue,
        activeInvite,
        addInvite,
        dismissInvite,
        removeInvite,
      }}
    >
      {children}
    </InviteContext.Provider>
  );
};

export const useInvite = () => {
  const context = useContext(InviteContext);
  if (context === undefined) {
    throw new Error("useInvite must be used within an InviteProvider");
  }
  return context;
};
