import { useEffect, useRef } from "react";
import { useUser } from "../Contexts/UserContext";
import { registerDevicePushToken } from "../Services/pushTokenApi";

export default function PushNotificationBootstrap() {
  const { userId, isAuthenticated } = useUser();
  const lastRegisteredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (lastRegisteredFor.current === userId) return;

    registerDevicePushToken({ userSubId: userId })
      .then(() => {
        lastRegisteredFor.current = userId;
      })
      .catch(() => {});
  }, [isAuthenticated, userId]);

  return null;
}
