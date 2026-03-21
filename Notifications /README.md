# Leaderboard

Actually the **Notifications** tab. Shows notifications (follows, achievements, likes, comments) and session invites with Accept/Decline.

---

## What It Does

- Renders a feed of notifications from the notifications API
- Renders session invites (from live session API) at the top
- Handles actions: tap follow → UserProfile; tap achievement → expand/share; tap invite → Accept/Decline
- Accept invite → navigate to LiveSession

---

## Key Files

| File | Purpose |
|------|---------|
| `LeaderboardMainPage.tsx` | Main screen. Fetches `getNotifications` and `getPendingInvites`, merges into a single list. Renders cards with icons by type. |

---

## Design Choices

### Unified feed (notifications + invites)

Notifications and session invites come from different APIs. They’re merged into one list so users see all activity and invites in one place. Invites are shown first.

### Session invites inline with notifications

Session invites are rendered as cards with Accept/Decline. InviteToast pops when an invite arrives and sends users here; handling happens in this screen, not in a separate modal.

### Stopping invite polling on 401/403

`listenForInvites` (in lib/sessionService) polls for invites. When auth fails (401/403), polling stops to avoid log spam. The user must sign in again for invites to resume.

---

## How It Connects to the Rest of the App

- **notificationsApi** – `getNotifications`, `markNotificationAsRead`
- **liveSessionApi** – `getPendingInvites`
- **lib/sessionService** – `acceptInvite`, `declineInvite`
- **InviteContext** – `removeInvite` after accept/decline
- **postsApi** – `createAchievementPost` (share achievement)
- **UserContext** – `userId` for navigation
- **NavBar** – Tab labeled Notifications
