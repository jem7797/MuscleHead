# constants

Static data for workouts and exercises.

---

## What It Does

- **workoutByMuscleGroup.ts** – Maps muscle groups to exercises (for workout building)
- **exerciseToMuscles.ts** – Maps exercises to muscle groups (for highlighting)

---

## Key Files

| File | Purpose |
|------|---------|
| `workoutByMuscleGroup.ts` | `WORKOUT_BY_MUSCLE_GROUP` – e.g. "Chest" → ["Bench Press", "Push-ups", ...]. Used when selecting exercises by muscle. |
| `exerciseToMuscles.ts` | `EXERCISE_TO_MUSCLES` – e.g. "Bench Press" → ["pecs", "triceps", ...]. Used to highlight muscles on the diagram after logging. |

---

## Design Choices

### Shared between AddWorkout and Live

Both AddWorkoutPage and LiveSessionScreen use these constants for muscle selection and exercise lists. Centralizing them keeps behavior consistent and avoids drift.

### Simple object maps

Data is plain objects. No API calls. Easy to extend by adding entries.

---

## How It Connects to the Rest of the App

- **WorkoutInputSection** – Uses these for muscle-based exercise selection and highlighting
- **AddWorkoutPage, LiveSessionScreen** – Via WorkoutInputSection
- **MovementContext** – May use or supplement this data for the full exercise catalog
