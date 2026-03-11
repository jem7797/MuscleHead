# Profile

User profile, edit flow, followers/following, follow requests, settings, accolades.

---

## What It Does

- **ProfileMain** – Current user profile: header, stats (Following/Posts/Followers), bio, metrics, posts
- **UserProfileScreen** – Any user's profile: follow, nemesis, Invite to Session
- **ProfileEditPage** – Edit bio, username, profile pic, privacy
- **FollowListScreen** – Followers or following list with follow/unfollow
- **FollowRequestsScreen** – Pending follow requests; accept/decline
- **AccoladesScreen** – View earned medals/achievements
- **ProfileComponents/** – StatsRow, ProfileHeader, SettingsModal, etc.

---

## Key Files

| File | Purpose |
|------|---------|
| `ProfileMain.tsx` | Own profile. Stats, bio, content. Uses SettingsModal for Edit/Accolades/Follow Requests. |
| `UserProfileScreen.tsx` | Other user's profile. Follow/Unfollow, Requested (private), nemesis, Invite to Session. |
| `ProfileEditPage.tsx` | Edit profile. Uses pfpUpload for profile pic. |
| `FollowListScreen.tsx` | Followers or following. Uses getFollowers/getFollowing. Supports follow request "Requested" state. |
| `FollowRequestsScreen.tsx` | Pending requests. Accept/Decline. |
| `AccoladesScreen.tsx` | Medals/achievements. |
| `ProfileComponents/SettingsModal.tsx` | Edit profile, Accolades, Follow Requests, Privacy. |

---

## Design Choices

### UserProfileScreen: follow vs request flow

For **public** users, follow creates a follow immediately. For **private** users, follow creates a request; the button shows "Requested" until accepted. We call `checkFollow` and `checkFollowRequestStatus` to set the correct state. `follow()` is the same; the backend decides based on privacy.

### Nemesis in UserProfileScreen

User can mark another user as "nemesis". Nemesis posts get special styling in the feed. Nemesis IDs are stored in backend + AsyncStorage and synced into UserContext.

### Profile pic upload flow

ProfileEditPage uses `pickAndUploadPfp` (pfpUpload): pick image → get presigned URL → upload to S3 → update user with CloudFront URL. Same pattern as CreatePost for images.

### FollowRequests accessible from Settings

Follow Requests is in Settings so users can manage requests from their profile. It’s not in the main nav to keep the bar simple.

---

## How It Connects to the Rest of the App

- **UserContext** – Profile data, `addToFollowingCount`, `refreshUserProfile`
- **followApi** – follow, unfollow, checkFollow, checkFollowRequestStatus, getFollowers, getFollowing, getFollowRequests, accept/decline
- **userApi** – getUser, updateUser
- **pfpUpload** – Profile pic upload
- **lib/sessionService** – createLiveSession, sendInvite (Invite to Session)
- **nemesisStorage** – Persist nemesis IDs
- **NavBar** – Profile tab
