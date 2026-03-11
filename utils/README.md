# utils

Small helpers used across the app.

---

## What It Does

- **profilePicUrl.ts** – Builds CloudFront URL for profile pictures from user data
- **muscleColor.ts** – Maps muscles to colors (e.g. for muscle diagram highlighting)

---

## Key Files

| File | Purpose |
|------|---------|
| `profilePicUrl.ts` | `getProfilePicUrl(user)` – builds URL from `profile_pic_url`, `profilePicUrl`, or `pfp_link` + `profilePicVersion`. Uses `CLOUDFRONT_BASE_URL`. |
| `muscleColor.ts` | `getMuscleColor(muscleId)` – returns a color for highlighting. Used by muscle diagram components. |

---

## Design Choices

### Handling multiple field names

Backend responses use different names (`profile_pic_url`, `profilePicUrl`, etc.). `getProfilePicUrl` checks several fields so it works with different API shapes.

### CloudFront for images

Profile pics live in S3; CloudFront serves them. The util uses `CLOUDFRONT_BASE_URL` from apiConfig so the CDN URL is centralized.

---

## How It Connects to the Rest of the App

- **profilePicUrl** – FeedPost, UserProfileScreen, FollowListScreen, UserSearchResults, ProfileHeader, etc.
- **muscleColor** – Muscle diagram components (MuscleManView, etc.)
