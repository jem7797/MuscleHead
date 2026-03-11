# MainPage

Workout hub: schedule, routines, recent workouts, muscle diagram, Add Workout flow.

---

## What It Does

- **WorkoutInputMainPage** – Schedule by day, muscle diagram, routines, recent workouts, Add Workout
- **AddWorkoutPage** – Log a workout (exercises, sets, reps, weight) via WorkoutInputSection
- **ActiveWorkoutPage** – In-progress workout with timer
- **ConfirmWorkoutPage** – Review and confirm workout
- **WorkoutStatsPage** – Stats for a workout
- **WorkoutDetailPage** – View a past workout
- **AddWorkoutTemplatePage** – Create templates
- **RoutineDetailPage** – View/edit a routine
- **ConfirmWorkoutPage** – Final step before saving

---

## Key Files

| File | Purpose |
|------|---------|
| `WorkoutInputMainPage.tsx` | Hub. Schedule editor, muscle diagram, routine cards, workout cards, Add Workout. Uses WorkoutsContext, RoutinesContext, workoutScheduleApi. |
| `AddWorkoutPage.tsx` | Uses WorkoutInputSection. Builds workout, navigates to ActiveWorkout. |
| `ActiveWorkoutPage.tsx` | Timer, exercise list, finish flow. |
| `ConfirmWorkoutPage.tsx` | Review and submit. Calls session log API, triggers medals/XP. |
| `WorkoutStatsPage.tsx` | Stats for a workout. |
| `WorkoutDetailPage.tsx` | Read-only view of a past workout. |
| `AddWorkoutTemplatePage.tsx` | Create workout templates. |
| `RoutineDetailPage.tsx` | Routine view/edit. |

---

## Design Choices

### Schedule stored per day

`workoutScheduleApi` stores schedule entries by `day_of_the_week`. WorkoutInputMainPage loads them and maps to a UI by day. The schedule links a day to a routine/template name.

### Contexts for workouts and routines

WorkoutsContext and RoutinesContext fetch and cache data. AddWorkoutPage and related screens rely on them so we don’t refetch on every navigation.

### WorkoutInputSection shared with Live

AddWorkoutPage and LiveSessionScreen both use WorkoutInputSection. AddWorkoutPage logs via session log API; LiveSessionScreen logs via Supabase. The UI is shared; the backend differs by screen.

### ConfirmWorkout submits and triggers achievements

ConfirmWorkoutPage submits the workout and receives newly awarded medals. It calls `addMedalsFromWorkout` so AchievementContext can show toasts. XP and rank are updated via UserContext.

---

## How It Connects to the Rest of the App

- **WorkoutsContext, RoutinesContext** – Workout and routine data
- **workoutScheduleApi** – Schedule CRUD
- **sessionLogApi** – Submit workout, get medals
- **AchievementContext** – `addMedalsFromWorkout`
- **UserContext** – `addToLifetimeStats`
- **MovementContext** – Exercise catalog
- **Components** – WorkoutInputSection, WorkoutCardsSection, RoutineCardsSection, MuscleManView, etc.
- **NavBar** – Workout tab routes here
