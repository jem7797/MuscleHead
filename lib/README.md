# lib

Libraries and integrations: Supabase, live session orchestration.

---

## What It Does

- **supabase.ts** – Supabase client and `isSupabaseConfigured`. Used for real-time exercise updates in live sessions.
- **sessionService.ts** – High-level live session API: create session, invite, accept/decline, subscribe to exercises, log exercise, end session. Combines REST (liveSessionApi) and Supabase.

---

## Key Files

| File | Purpose |
|------|---------|
| `supabase.ts` | Creates Supabase client from env. Exports `supabase` and `isSupabaseConfigured()`. |
| `sessionService.ts` | Orchestrates live sessions. Wraps liveSessionApi; adds Supabase subscription for real-time exercises; polls for invites via `listenForInvites`. |

---

## Design Choices

### sessionService as facade

Live sessions use both REST (invites, session CRUD) and Supabase (real-time exercises). `sessionService` hides that split. Callers use `subscribeToSession`, `logExercise`, etc., without caring whether data comes from REST or Supabase.

### Supabase for real-time only

Session and invite CRUD go through the REST API. Supabase is used only for `postgres_changes` on `live_session_exercises`. That keeps auth and business logic in the backend and uses Supabase just for real-time sync.

### listenForInvites: polling, not websockets

Pending invites are fetched by polling `getPendingInvites` every 5 seconds. When the backend adds push/websocket support, this can be swapped without changing the rest of the app.

### Stop polling on auth failure

If `getPendingInvites` returns 401/403, polling stops. This avoids repeated failed requests and log spam when the session is invalid.

---

## How It Connects to the Rest of the App

- **liveSessionApi** – All REST calls for live sessions
- **supabase** – Real-time subscription for exercises
- **InviteNotification** – Uses `listenForInvites`
- **LeaderboardMainPage** – Uses `acceptInvite`, `declineInvite`, `getPendingInvites` (via liveSessionApi)
- **LiveSessionScreen** – Uses `subscribeToSession`, `logExercise`, `fetchSessionExercises`, `endSession`
- **FriendsListScreen, UserProfileScreen** – Use `createLiveSession`, `sendInvite`
