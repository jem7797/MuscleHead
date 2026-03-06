# Muscle Groups Reference for Backend Consistency

This document defines the canonical muscle group names and their mapping to the muscle man visualization. Use these values in the backend (e.g., `areaOfActivation` on movements, worked-muscles endpoint responses) so the app displays correctly.

---

## Canonical Muscle Group Names (use these in backend)

These are the **primary keys** the app expects. Use these for `areaOfActivation` on movements and for any worked-muscles API response.

| Canonical Name | Aliases (app accepts) | Side |
|----------------|----------------------|------|
| **Chest** | pecs, pectoral | front |
| **Arms** | biceps, triceps | front |
| **Shoulders** | delts | front + back |
| **Back** | lats, latissimus | back |
| **Legs** | quads, quadriceps, hamstrings | front + back |
| **Glutes** | — | back |
| **Calves** | — | front + back |
| **Abs** | — | front |
| **Core** | obliques | front |
| **Traps** | trapezius | back |

**Note:** AddWorkoutPage has a typo `Calfs` – the canonical name should be **Calves**.

---

## Mapping: Canonical Name → Muscle Man IDs (front / back)

When the backend returns "worked muscles," it can return either:
- **Option A:** Canonical group names (e.g. `["Chest", "Back", "Legs"]`) – the app maps these to muscle IDs.
- **Option B:** Internal muscle IDs (e.g. `["pecs", "lats", "quads"]`) – the app uses these directly.

### Option A: Return canonical names

The app maps these to front/back muscle IDs as follows:

| Canonical | Front IDs | Back IDs |
|-----------|-----------|----------|
| Chest | pecs, chest, pectoral | — |
| Arms | biceps, triceps | triceps |
| Shoulders | delts | delts, shoulders |
| Back | — | lats, latissimus |
| Legs | quads, quadriceps | hamstrings, glutes |
| Glutes | — | glutes |
| Calves | calves | calves |
| Abs | abs | — |
| Core | abs, obliques | obliques |
| Traps | — | traps, trapezius |

### Option B: Return internal muscle IDs (what MuscleManFront/Back expect)

These are the IDs the SVG components use. Canonical names are normalized (lowercase, strip non-alphanumeric) before lookup.

**Front-view muscle IDs:**
- `pecs`, `pectoral`, `chest` → pectorals
- `biceps`, `triceps` → arms
- `delts` → shoulders
- `abs` → abs
- `obliques` → obliques
- `quads`, `quadriceps` → quads
- `calves` → calves
- `traps` → trapezius (front)
- `forearms`, `outerforearms`, `innerforearms` → forearms

**Back-view muscle IDs:**
- `delts`, `shoulders` → deltoids
- `traps`, `trapezius` → trapezius
- `lats`, `latissimus` → lats
- `triceps` → triceps
- `forearms`, `outerforearms`, `innerforearms` → forearms
- `glutes` → glutes
- `hamstrings` → hamstrings
- `adductors` → adductors
- `calves` → calves
- `obliques` → obliques (back)

---

## SVG Path IDs (for reference – do not use in API)

The muscle man SVGs use granular path IDs. The app maps group names to these internally. You do **not** need to return these from the backend.

**Front:** `leftpec`, `rightpec`, `leftbicep`, `rightbicep`, `lefttricepfront`, `righttricepfront`, `leftdeltoid`, `rightdeltoid`, `leftquad`, `rightquad`, `leftcalffront`, `rightcalffront`, `lefttrapeziusfront`, `righttrapeziusfront`, `rightab1`–`rightab6`, `leftab1`–`leftab6`, `rightoblique1`–`6`, `leftoblique1`–`6`, `rightforearmouter`, `leftforearmouter`, `rightforearminner`, `leftforearminner`

**Back:** `rightdeltoidback`, `leftdeltoidback`, `righttrapezius`, `lefttrapezius`, `rightlat`, `leftlat`, `righttricep`, `lefttricep`, `rightglutemaximus`, `leftglutemaximus`, `righthamstring`, `lefthamstring`, `rightadductor`, `leftadductor`, etc.

---

## Data Flow Summary

1. **Movement API** – Each movement has `areaOfActivation` (string). Use one of the canonical names above.
2. **Session log** – Exercises are sent as `{ exerciseId, sets, reps, weight }`. Backend looks up movement → `areaOfActivation` to derive worked muscles.
3. **Worked-muscles endpoint** (if you add one) – Return either:
   - `{ frontWorked: ["pecs", "delts", "quads"], backWorked: ["lats", "triceps"] }`, or
   - `{ muscleGroups: ["Chest", "Shoulders", "Back", "Legs"] }` (app will map to IDs)

---

## Files in app that define these mappings

| File | Purpose |
|------|---------|
| `MainPage/ActiveWorkoutPage.tsx` | MUSCLE_GROUP_MAP – maps areaOfActivation to front/back IDs for active workout preview |
| `MainPage/AddWorkoutPage.tsx` | WORKOUT_BY_MUSCLE_GROUP, EXERCISE_TO_MUSCLES – dropdown options and exercise→muscle mapping |
| `Components/MuscleManFront.tsx` | GROUPS – maps group names to SVG path IDs (front) |
| `Components/MuscleManBack.tsx` | GROUPS – maps group names to SVG path IDs (back) |
| `MuscleDetail/MuscleDetailScreen.tsx` | MUSCLE_INFO – muscle IDs for the muscle guide selector |
