# Community

The social feed and community features: posts from followed users, create post flow, friends list, and hidden-user fallback.

---

## What It Does

- **Feed** – Shows posts from people you follow (paginated, pull-to-refresh)
- **Create Post** – Pick or take a photo, add caption, post to feed
- **Friends List** – Mutual followers; can invite friends to live workouts
- **Hidden Feed** – Placeholder screen when the user's privacy is `hidden` (no feed access)

---

## Key Files

| File | Purpose |
|------|---------|
| `index.tsx` | Main Community screen (feed). Renders `FeedPost` items, header with Create Post + Friends. |
| `FeedPost.tsx` | Single post: image, caption, like, comment, delete. Handles nemesis styling. |
| `CreatePostScreen.tsx` | Image picker/camera, caption, upload via presigned URL, create post. |
| `FriendsListScreen.tsx` | Mutual friends from `getMutualFriends`, search, Invite to Session. |
| `HiddenFeed.tsx` | Shown when `privacySetting === "hidden"`. Explains restrictions. |

---

## Design Choices

### Feed routing: Community vs HiddenFeed

The **NavBar** (not in this folder) routes the Community tab to `Community` or `HiddenFeed` based on `privacySetting`. If the user is hidden, they see `HiddenFeed` instead of the feed. That keeps the feed logic in one place and uses a simple conditional route.

### Feed invalidation via UserContext

`feedInvalidationTrigger` in `UserContext` is incremented when the user creates a post or changes profile. The Community screen listens to it and reloads the feed. This avoids prop drilling and keeps feed and profile changes in sync.

### Nemesis posts

Nemesis posts are styled differently (e.g. red background) using `nemesisSubIds` from `UserContext`. The API returns posts; the UI applies styling based on whether the post author is in `nemesisSubIds`. This keeps styling in the client instead of the backend.

### Create Post: presigned URL flow

Images are uploaded to S3 via a presigned URL from the backend. Flow:

1. User selects/takes image
2. `getPresignedImageUrl()` → backend returns URL
3. `uploadImageToS3()` → upload bytes to S3
4. `createPost()` → backend creates post with S3 object key

The backend never receives the image bytes; only the object key. This reduces load on the API and scales better.

---

## How It Connects to the Rest of the App

- **UserContext** – `userId`, `nemesisSubIds`, `feedInvalidationTrigger`, `privacySetting`
- **postsApi** – `getFeed`, `getPost`, `patchPost`, `deletePost`, `createPost`, presigned URL
- **followApi** – `getMutualFriends` (for Friends list)
- **lib/sessionService** – `createLiveSession`, `sendInvite` (Invite to Session)
- **NavBar** – Routes to Community, HiddenFeed, FriendsList, CreatePost
- **UserProfileScreen** – Opens when tapping a user on a post or in Friends list
