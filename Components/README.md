# Components

Reusable UI components and app-wide overlays (NavBar, toasts, modals, buttons, etc.).

---

## What It Does

Provides shared building blocks used across screens: navigation bar, buttons, headers, muscle diagrams, achievement and invite toasts, and various form/selection components.

---

## Key Files (by category)

### Navigation & layout

| File | Purpose |
|------|---------|
| `NavBar.tsx` | Bottom tab bar. Routes: Community/hiddenFeed, Search/hiddenSearch, Workout, Notifications, Profile. Uses `privacySetting` for hidden routing; highlights active tab. |
| `BackButton.tsx` | Header back button; calls `navigation.goBack()`. |
| `PageHeader.tsx` | Screen header with optional back + title + trailing (e.g. End Session). |

### Toasts & overlays

| File | Purpose |
|------|---------|
| `AchievementToast.tsx` | Xbox-style pill for MEDAL_EARNED. Uses `AchievementContext`; on tap navigates to Notifications. |
| `InviteToast.tsx` | Same pattern for session invites. Uses `InviteContext`; marks invite as toast-seen when displayed; on tap goes to Notifications. |
| `InviteNotification.tsx` | No UI. Subscribes to `listenForInvites` and pushes unseen invites into `InviteContext`. |

**Why split InviteNotification and InviteToast?** – Listening (polling) and display are separate. The listener runs in the background; the toast shows when an invite is added to the queue. Clean separation of concerns.

### Buttons

| File | Purpose |
|------|---------|
| `PrimaryButton.tsx` | Main CTA button (various variants). |
| `SecondaryButton.tsx` | Secondary/ghost style. |
| `AddWorkoutMenu.tsx` | Add-workout menu entry (e.g. barbell icon). |

### Workout & muscles

| File | Purpose |
|------|---------|
| `WorkoutInputSection.tsx` | Shared workout input: WorkoutBoxes, muscle diagram, timer, AddWorkoutButton. Used by AddWorkoutPage and LiveSessionScreen. |
| `WorkoutCard.tsx` | Card for a workout entry. |
| `WorkoutCardsSection.tsx` | List of WorkoutCards. |
| `MuscleManView.tsx` / `MuscleWomanFront.tsx` / `MuscleWomanBack.tsx` / etc. | SVG muscle diagrams. Gender-aware; used for muscle selection. |
| `LogExerciseModal.tsx` | Modal to log an exercise (sets, reps, weight). |

### Other

| File | Purpose |
|------|---------|
| `StatsRow.tsx` | Stats row (Following, Posts, Followers) with tap handlers. |
| `ScheduleBuilderModal.tsx` | Modal for building workout schedule. |
| `DayHeader.tsx` | Day label in schedule/template UI. |

---

## Design Choices

### NavBar and privacy

NavBar reads `privacySetting` from `UserContext`. If `"hidden"`, tapping Community or Search goes to `hiddenFeed` or `hiddenSearch` instead of the real feed/search. Highlighting treats those screens as equivalent to Community/Search so the active tab is correct.

### Toast pattern (AchievementToast, InviteToast)

Both follow the same flow:
1. Context holds a **queue** of items.
2. First item is **active** and shown in a pill.
3. Timer or tap dismisses it and moves to the next.
4. Tap navigates to Notifications (where details live).

For invites, the displayed toast is also marked as seen via backend API so old pending invites are not replayed on app restart.

This keeps toasts simple, non-blocking, and consistent.

### WorkoutInputSection reuse

AddWorkoutPage and LiveSessionScreen both need muscle selection, exercise logging, and timer. `WorkoutInputSection` centralizes that UI and behavior so both screens stay in sync and avoid duplication.

---

## How It Connects to the Rest of the App

- **UserContext** – `pfpLink`, `privacySetting` (NavBar); `userId` (InviteNotification).
- **InviteContext** – Used by InviteToast, InviteNotification, LeaderboardMainPage.
- **AchievementContext** – Used by AchievementToast.
- **lib/sessionService** – Used by InviteNotification for `listenForInvites`.
- **Navigation** – NavBar, BackButton, PageHeader use `useNavigation` / `useRoute`.
- **Screens** – Components are composed into screens in Community, Profile, MainPage, Live, etc.
