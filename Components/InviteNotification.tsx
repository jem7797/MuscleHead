import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useUser } from "../Contexts/UserContext";
import {
  listenForInvites,
  acceptInvite,
  declineInvite,
  type SessionInvite,
} from "../lib/sessionService";

type NavigationRef = React.RefObject<{
  navigate: (name: string, params?: object) => void;
  isReady?: () => boolean;
} | null>;

interface InviteNotificationProps {
  navigationRef: NavigationRef;
}

/**
 * Listens for live session invites and shows Accept/Decline Alert.
 * Mount at app level so it works on any screen.
 */
const InviteNotification: React.FC<InviteNotificationProps> = ({
  navigationRef,
}) => {
  const { userId, isAuthenticated } = useUser();
  const processingRef = useRef(false);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const unsubscribe = listenForInvites({
      userId,
      onInviteReceived: (invite: SessionInvite) => {
        if (processingRef.current) return;

        const message = invite.message
          ? `${invite.message}\n\nAccept to join the live workout?`
          : "You've been invited to join a live workout. Accept?";

        Alert.alert("Live Workout Invite", message, [
          {
            text: "Decline",
            style: "cancel",
            onPress: async () => {
              processingRef.current = true;
              try {
                await declineInvite({ inviteId: invite.id });
              } catch (e) {
                console.error("Failed to decline invite:", e);
              } finally {
                processingRef.current = false;
              }
            },
          },
          {
            text: "Accept",
            onPress: async () => {
              processingRef.current = true;
              try {
                await acceptInvite({ inviteId: invite.id });
                if (navigationRef.current?.navigate) {
                  navigationRef.current.navigate("LiveSession", {
                    sessionId: invite.session_id,
                    currentUserId: userId,
                    hostUserId: invite.from_user_id,
                    guestUserId: userId,
                  });
                }
              } catch (e) {
                console.error("Failed to accept invite:", e);
                Alert.alert(
                  "Error",
                  e instanceof Error
                    ? e.message
                    : "Could not join the session.",
                );
              } finally {
                processingRef.current = false;
              }
            },
          },
        ]);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [userId, isAuthenticated, navigationRef]);

  return null;
};

export default InviteNotification;
