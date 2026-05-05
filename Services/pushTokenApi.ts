import { Platform } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { supabase } from "../lib/supabase";

type RegisterPushTokenArgs = {
  userSubId: string;
};

async function getApnsToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      PushNotificationIOS.removeEventListener("register");
      PushNotificationIOS.removeEventListener("registrationError");
      resolve(null);
    }, 10000);

    PushNotificationIOS.addEventListener("register", (token: string) => {
      clearTimeout(timeout);
      PushNotificationIOS.removeEventListener("register");
      PushNotificationIOS.removeEventListener("registrationError");
      resolve(token || null);
    });

    PushNotificationIOS.addEventListener("registrationError", () => {
      clearTimeout(timeout);
      PushNotificationIOS.removeEventListener("register");
      PushNotificationIOS.removeEventListener("registrationError");
      resolve(null);
    });

    PushNotificationIOS.requestPermissions().catch(() => {
      clearTimeout(timeout);
      PushNotificationIOS.removeEventListener("register");
      PushNotificationIOS.removeEventListener("registrationError");
      resolve(null);
    });
  });
}

/**
 * Requests iOS notification permission, fetches APNs token, and stores it in Supabase.
 */
export async function registerDevicePushToken({
  userSubId,
}: RegisterPushTokenArgs): Promise<void> {
  if (!userSubId || Platform.OS !== "ios") return;

  const apnsToken = await getApnsToken();
  if (!apnsToken) return;

  const { error } = await supabase.from("user_push_tokens").upsert(
    {
      user_sub_id: userSubId,
      platform: "ios",
      apns_token: apnsToken,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_sub_id,platform,apns_token",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw error;
  }
}
