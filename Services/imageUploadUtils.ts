/**
 * Shared helpers for image upload flows.
 * Polls CloudFront URL after S3 upload to confirm Lambda has approved and moved the image.
 */

const POLL_RETRIES = 6;
const POLL_INTERVAL_MS = 2000;
const REJECTED_MESSAGE = "Your image was rejected. Please upload an appropriate photo.";

/**
 * Polls a CloudFront URL with HEAD requests until it returns 200.
 * Lambda scans images asynchronously; approved images are moved to the main bucket.
 * @param cloudFrontUrl - Full URL to the image on CloudFront
 * @throws Error with REJECTED_MESSAGE if image never becomes accessible
 */
export async function waitForImageAccessible(cloudFrontUrl: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_RETRIES; attempt++) {
    const res = await fetch(cloudFrontUrl, { method: "HEAD" });
    if (res.ok) return;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(REJECTED_MESSAGE);
}
