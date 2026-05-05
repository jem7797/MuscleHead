import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";

type RegisterPushTokenArgs = {
  userSubId: string;
};

async function requestIosPushPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/**
 * Requests iOS notification permission, fetches APNs token, and stores it in Supabase.
 */
export async function registerDevicePushToken({
  userSubId,
}: RegisterPushTokenArgs): Promise<void> {
  if (!userSubId || Platform.OS !== "ios") return;

  const granted = await requestIosPushPermission();
  if (!granted) return;

  const tokenResponse = await Notifications.getDevicePushTokenAsync();
  const apnsToken = tokenResponse?.data;
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
