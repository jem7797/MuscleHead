import React, { useEffect } from "react";
import { useUser } from "../Contexts/UserContext";
import { useInvite } from "../Contexts/InviteContext";
import { listenForInvites, type SessionInvite } from "../lib/sessionService";

/**
 * Listens for live session invites and adds them to InviteContext.
 * InviteToast shows the popup; Accept/Decline happens in the Notifications tab.
 */
const InviteNotification = () => {
  const { userId, isAuthenticated } = useUser();
  const { addInvite } = useInvite();

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const unsubscribe = listenForInvites({
      userId,
      onInviteReceived: (invite: SessionInvite) => {
        addInvite(invite);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [userId, isAuthenticated, addInvite]);

  return null;
};

export default InviteNotification;
