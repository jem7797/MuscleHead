/**
 * Profile picture upload via S3 presigned URL.
 * Flow: pick image -> get presigned URL -> PUT to S3 -> return CloudFront URL.
 *
 * Requires expo-image-picker native module. If you see "ExponentImagePicker" errors
 * or the app keeps refreshing, run: npx expo run:ios (or run:android) to rebuild.
 */

import { getPresignedUrl } from "./s3Api";
import { CLOUDFRONT_BASE_URL } from "./apiConfig";
import { waitForImageAccessible } from "./imageUploadUtils";

const OBJECT_KEY_PREFIX = "users";
const PROFILE_FILENAME = "profile.jpg";

/** Set to true to enable image picker (requires native rebuild). Prevents crash loop when native module isn't linked. */
const IMAGE_PICKER_ENABLED = true;

/**
 * Picks an image, uploads to S3 via presigned URL, returns the CloudFront URL.
 * @param subId - User's sub ID for the object key
 * @returns CloudFront URL of the uploaded image, or null if cancelled/failed
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

  const getBlob = () => fetch(uri).then((r) => r.blob());

  // Try with Content-Type first (backend must sign with same value). Fallback: try without if 403.
  const contentType = "image/jpeg";
  let presignedUrl = await getPresignedUrl(objectKey, "UPLOAD", contentType);
  let blob = await getBlob();

  let uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });

  if (uploadRes.status === 403) {
    // Backend may not support contentType; try presigned URL without Content-Type in signature
    presignedUrl = await getPresignedUrl(objectKey, "UPLOAD");
    blob = await getBlob();
    uploadRes = await fetch(presignedUrl, { method: "PUT", body: blob });
  }

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    const msg = errBody ? `${uploadRes.status}: ${errBody.slice(0, 200)}` : `Upload failed: ${uploadRes.status}`;
    throw new Error(msg);
  }

  const base = CLOUDFRONT_BASE_URL.replace(/\/$/, "");
  const path = `${base}/${objectKey}?t=${Date.now()}`;
  const cloudFrontUrl = path.startsWith("http") ? path : `https://${path}`;
  await waitForImageAccessible(cloudFrontUrl);
  return cloudFrontUrl;
};
