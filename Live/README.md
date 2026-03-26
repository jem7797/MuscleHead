# Live

Live workout sessions: host/guest tabs, real-time exercise sync via Supabase, invite flow.

---

## What It Does

- Host creates a session, invites a friend
- Guest receives invite toast for unseen pending invites (toast → Notifications), accepts → joins
- Both see Host and Guest tabs with separate exercise lists
- Exercises sync in real time via Supabase `postgres_changes`
- Host can end the session

---

## Key Files

| File | Purpose |
|------|---------|
| `LiveSessionScreen.tsx` | Main screen. Host/Guest tabs, WorkoutInputSection for both, End Session. Subscribes to exercise updates via `subscribeToSession`. |

---

## Design Choices

### Supabase for real-time sync

Exercises are written to Supabase (`live_session_exercises`); the app subscribes to `postgres_changes` for that table. When anyone logs an exercise, all clients get it without polling. The REST API is still used for session/invite CRUD.

### Separate host/guest exercise lists

Exercises are split by `user_id` so each tab shows only that user’s exercises. The subscription handler routes new rows into the correct list.

### WorkoutInputSection reuse

LiveSessionScreen uses the same `WorkoutInputSection` as AddWorkoutPage. Exercises are logged via Supabase `insert` (sessionService.logExercise), not the REST API. The UI and muscle selection stay consistent.

### No NavBar on LiveSession

LiveSession is full-screen; NavBar is hidden so the layout isn’t cramped. Back/End Session is in the header.

---

## How It Connects to the Rest of the App

- **lib/sessionService** – `subscribeToSession`, `logExercise`, `fetchSessionExercises`, `endSession`
- **Services/liveSessionApi** – `getSession`, `getPendingInvites` (Notifications), `getUnseenPendingInvites` + `markInviteToastSeen` (toast flow)
- **InviteToast / InviteNotification** – Poll unseen invites, show toast, mark toast as seen, then user can Accept in Notifications and navigate here
- **Community/FriendsListScreen** – Invite to Session creates session and navigates here
- **Components/WorkoutInputSection** – Shared workout input UI
- **constants/workoutByMuscleGroup, exerciseToMuscles** – Exercise catalog
