/**
 * Profile picture upload via S3 presigned URL.
 * Flow: POST presigned-url -> PUT image (Content-Type from response) -> PATCH user with objectKey.
 * Backend returns presigned download URL in PATCH response; refresh user to display.
 *
 * Requires expo-image-picker native module. If you see "ExponentImagePicker" errors
 * or the app keeps refreshing, run: npx expo run:ios (or run:android) to rebuild.
 */

import { getPresignedUrl } from "./s3Api";

const OBJECT_KEY_PREFIX = "users";
const PROFILE_FILENAME = "profile.jpg";

/**
 * Uploads image bytes to S3 via presigned URL.
 * Same flow used for profile pictures and post images.
 * @param objectKey - S3 object key (e.g. "users/{subId}/profile.jpg" or "posts/{subId}/{timestamp}.jpg")
 * @param imageUri - Local URI from ImagePicker
 * @returns void, throws on failure
 */
export async function uploadImageToPresignedUrl(objectKey: string, imageUri: string): Promise<void> {
  const { url, contentType } = await getPresignedUrl(objectKey, "UPLOAD", "application/octet-stream");

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    const msg = errBody ? `${uploadRes.status}: ${errBody.slice(0, 200)}` : `Upload failed: ${uploadRes.status}`;
    throw new Error(msg);
  }
}

/** Set to true to enable image picker (requires native rebuild). Prevents crash loop when native module isn't linked. */
const IMAGE_PICKER_ENABLED = true;

/**
 * Picks an image, uploads to S3 via presigned URL.
 * @param subId - User's sub ID for the object key
 * @returns The objectKey to pass to PATCH /user/api/{subId} as profilePicUrl, or null if cancelled
 */
export const pickAndUploadPfp = async (subId: string): Promise<string | null> => {
  if (!IMAGE_PICKER_ENABLED) {
    throw new Error(
      "Profile picture upload requires a native rebuild. Run: npx expo run:ios (or run:android), then set IMAGE_PICKER_ENABLED=true in pfpUpload.ts."
    );
  }

  const ImagePicker = await import("expo-image-picker");

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Camera roll permission is required to change your profile picture.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const uri = result.assets[0].uri;
  const objectKey = `${OBJECT_KEY_PREFIX}/${subId}/${PROFILE_FILENAME}`;
  await uploadImageToPresignedUrl(objectKey, uri);
  return objectKey;
};
