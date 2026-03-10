# Live Workout Session

Real-time workout sessions where two users can work out together.

## Setup

1. **Environment variables** – Add to your `.env` or app config:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Supabase Realtime** – Enable replication for `live_session_exercises` and `session_invites` in your Supabase project (Dashboard → Database → Replication).

## Usage

### Starting a session (host)

```ts
import { createLiveSession, sendInvite } from "../lib/sessionService";

// Host is derived from JWT by the backend
const session = await createLiveSession();
await sendInvite({
  sessionId: session.id,
  toUserId: friendUserId,
  message: "Let's lift!",
});

// Navigate to LiveSession
navigation.navigate("LiveSession", {
  sessionId: session.id,
  currentUserId,
  hostUserId: session.host_user_id,
  guestUserId: null,
});
```

### Accepting an invite

`InviteNotification` listens for invites and shows an Alert. On Accept, it calls `acceptInvite` and navigates to `LiveSession`.

### Joining as guest (after invite accepted)

The host can share the session ID; the guest navigates with:

```ts
navigation.navigate("LiveSession", {
  sessionId,
  currentUserId: guestUserId,
  hostUserId,
  guestUserId,
});
```
