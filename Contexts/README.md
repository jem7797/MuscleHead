# Contexts

React Context providers that hold global app state and shared logic.

---

## What It Does

Manages cross-screen state that many components need: user profile, auth, workouts, routines, achievements, session invites, onboarding, and worked muscles.

---

## Key Files

| Context | Purpose |
|---------|---------|
| `UserContext.tsx` | Current user: auth (userId, isAuthenticated), profile (username, bio, pfpLink, xp, rank), privacy, nemesisSubIds, feedInvalidationTrigger. Also `addToLifetimeStats`, `addToFollowingCount`, `refreshUserProfile`. |
| `InviteContext.tsx` | Queue of live session invites. `addInvite`, `dismissInvite`, `removeInvite`. Used by InviteToast and LeaderboardMainPage. |
| `AchievementContext.tsx` | Queue of MEDAL_EARNED notifications to show. Fetches from notifications API, persists shown IDs to AsyncStorage. Used by AchievementToast. |
| `OnboardingContext.tsx` | Data collected during signup: gender, height, weight, privacy, toggles. Consumed by IdentityBasics, HeightWeight, ProfileSetUp. |
| `WorkoutsContext.tsx` | Paginated list of user's workouts. Fetches, load-more. |
| `RoutinesContext.tsx` | User's workout routines. |
| `WorkoutTemplateContext.tsx` | Templates for building workouts. |
| `MovementContext.tsx` | Exercise/movement catalog. |
| `WorkoutStatsContext.tsx` | Stats for workouts (e.g. for stats page). |
| `GlobalWorkedMusclesContext.tsx` | Muscles worked across sessions (for muscle diagram). |
| `WorkedMusclesContext.tsx` | Worked muscles for a single session. |

---

## Design Choices

### UserContext as source of truth

Profile data (username, bio, pfp, xp, followers, etc.) lives in UserContext and is fetched on auth. Screens use it instead of passing data down. `refreshUserProfile` reloads after edits; `feedInvalidationTrigger` lets Community/Search refetch when profile changes.

### InviteContext and achievement-style toasts

Invites and achievements both use a queue in context. A single "active" item is shown in a toast; dismissing moves to the next. This avoids modal spam and keeps the pattern consistent.

### Persisting shown achievement IDs

AchievementContext stores shown medal IDs in AsyncStorage so we don't re-show the same achievement. Throttling (`FETCH_THROTTLE_MS`) limits how often we hit the notifications API.

### OnboardingContext for signup flow

IdentityBasics, HeightWeight, and ProfileSetUp collect data into OnboardingContext. ProfileSetUp then sends it all in one `updateUser` call. Context avoids prop drilling through the multi-step flow.

---

## How It Connects to the Rest of the App

- **UserContext** – Used by NavBar, Community, Profile, Search, FeedPost, FollowListScreen, etc.
- **InviteContext** – Used by InviteToast, InviteNotification, LeaderboardMainPage.
- **AchievementContext** – Used by AchievementToast.
- **OnboardingContext** – Used by SignUp (stores gender/height/weight), IdentityBasics, HeightWeight, ProfileSetUp.
- **Workouts/Routines/Template contexts** – Used by MainPage, AddWorkoutPage, RoutineDetailPage, etc.
