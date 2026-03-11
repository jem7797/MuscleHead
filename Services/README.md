# Services

API clients and app services. All backend communication goes through these modules.

---

## What It Does

Provides typed functions for each backend domain: users, posts, follow, notifications, workouts, live sessions, etc. Uses `apiConfig` for base URL, auth, and request/response handling.

---

## Key Files

| File | Purpose |
|------|---------|
| `apiConfig.ts` | Base URL, `getCurrentUserSub`, `apiRequest` (adds Bearer token, handles 403), `parseJsonResponse`. All API calls use this. |
| `userApi.ts` | getUser, getCurrentUserProfile, updateUser, searchUsers, createUser, deleteUser, reportMinorSignupAttempt. |
| `postsApi.ts` | getFeed, getPost, createPost, patchPost, deletePost, presigned URL for images. |
| `followApi.ts` | follow, unfollow, checkFollow, getFollowers, getFollowing, getMutualFriends. Plus: getFollowRequests, accept/decline, checkFollowRequestStatus (private-account flow). |
| `notificationsApi.ts` | getNotifications, markNotificationAsRead. |
| `liveSessionApi.ts` | createLiveSession, sendInvite, acceptInvite, declineInvite, getSession, getPendingInvites, endSession. |
| `sessionLogApi.ts` | Submit workout, get newly awarded medals. |
| `workoutScheduleApi.ts` | Schedule CRUD. |
| `workoutTemplateApi.ts` | Template CRUD. |
| `movementApi.ts` | Exercise/movement catalog. |
| `workedMusclesApi.ts` | Worked muscles per user. |
| `medalsApi.ts` | Medals/achievements. |
| `pfpUpload.ts` | Pick image, get presigned URL, upload to S3, return CloudFront URL. |
| `recentSearchesService.ts` | AsyncStorage-based recent searches. |
| `nemesisStorage.ts` | AsyncStorage for nemesis sub IDs. |

---

## Design Choices

### apiRequest adds auth automatically

`apiRequest` fetches the Amplify ID token and adds `Authorization: Bearer <token>`. Most endpoints need auth; `includeSub` can add `sub` to the body for endpoints that expect it.

### ID token, not access token

The backend validates the Cognito ID token (which has the `aud` claim). `fetchAuthSession` returns both; we use `idToken` for the Bearer header.

### Presigned URLs for uploads

Images (posts, profile pics) go through: 1) get presigned URL from backend, 2) upload bytes directly to S3. The backend never receives the file, which keeps it lightweight and scalable.

### 403 handling

When the API returns 403, `parseJsonResponse` logs a hint (token/aud/permissions). Invite polling in `lib/sessionService` stops on 401/403 to avoid repeated errors.

---

## How It Connects to the Rest of the App

- **apiConfig** – Used by all other Services
- **userApi** – UserContext, Profile, Search
- **postsApi** – Community, FeedPost, CreatePostScreen
- **followApi** – Profile, Search, FollowListScreen, FriendsListScreen
- **notificationsApi** – LeaderboardMainPage, AchievementContext
- **liveSessionApi** – LeaderboardMainPage, lib/sessionService
- **sessionLogApi** – ConfirmWorkoutPage, AchievementContext
- **pfpUpload** – ProfileEditPage
