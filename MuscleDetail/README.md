# MuscleDetail

Interactive muscle diagram: tap muscles to see info and suggested exercises. Used for exploring anatomy and planning workouts.

---

## What It Does

- Shows front/back body diagrams (male/female via UserContext gender)
- User taps a muscle group → InfoPanel shows name, description, exercise suggestions
- MuscleSelector lets you pick a muscle directly
- WorkedMusclesContext can highlight muscles based on workout data

---

## Key Files

| File | Purpose |
|------|---------|
| `MuscleDetailScreen.tsx` | Main screen. Renders MuscleMan/MuscleWoman components, InfoPanel, MuscleSelector. Uses `MUSCLE_INFO` map for descriptions and exercise lists. |
| `MuscleDetailScreen Components/InfoPanel.tsx` | Displays selected muscle info. |
| `MuscleDetailScreen Components/MuscleSelector.tsx` | Dropdown/selector for muscle groups. |

---

## Design Choices

### Gender-aware diagrams

Uses `gender` from UserContext to show MuscleMan or MuscleWoman. Keeps the experience relevant to the user.

### MUSCLE_INFO in the screen file

Muscle names, descriptions, and exercise suggestions live in `MUSCLE_INFO` inside MuscleDetailScreen. This keeps them close to the UI. A shared constants file could be used if this data grows.

### WorkedMusclesProvider

The screen wraps content in WorkedMusclesProvider so muscle highlight state can be used by child components. The provider scope is limited to this screen.

---

## How It Connects to the Rest of the App

- **UserContext** – `gender` for male/female diagram
- **WorkedMusclesContext** – Highlight state for worked muscles
- **Components** – MuscleManFront, MuscleManBack, MuscleWomanFront, MuscleWomanBack
- **Navigation** – Reached from muscle diagram on WorkoutInputMainPage or other entry points
