import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { SessionInvite } from "../lib/sessionService";

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
    setInviteQueue((prev) => {
      if (prev.some((i) => i.id === invite.id)) return prev;
      return [...prev, invite];
    });
  }, []);

  const dismissInvite = useCallback(() => {
    setInviteQueue((prev) => prev.slice(1));
  }, []);

  const removeInvite = useCallback((inviteId: string) => {
    setInviteQueue((prev) => prev.filter((i) => i.id !== inviteId));
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
