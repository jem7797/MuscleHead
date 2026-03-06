# Worked Muscles – Frontend Specification

Use this document to compare the frontend implementation with the backend.

---

## 1. Base URL & Auth

| Item | Value |
|------|-------|
| **API Base URL** | `http://192.168.86.25:8082` (from `apiConfig.ts`) |
| **Auth** | JWT ID token in `Authorization: Bearer <token>` header |
| **User ID source** | `getCurrentUserSub()` → AWS Cognito `userId` (the `sub` claim) |

---

## 2. Endpoints

### GET – Fetch worked muscles

| Item | Value |
|------|-------|
| **URL** | `GET {baseUrl}/workedMuscles/api/{userId}` |
| **Example** | `GET http://192.168.86.25:8082/workedMuscles/api/94986468-a081-70d5-d999-ef5244a5d74c` |
| **Path param** | `userId` = Cognito sub (UUID string) |
| **Headers** | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `Accept: application/json` |
| **Body** | None |

**Expected response (200 OK):**
```json
{
  "frontWorked": ["pecs", "delts", "quads"],
  "backWorked": ["lats", "triceps"]
}
```

**Empty response:**
```json
{
  "frontWorked": [],
  "backWorked": []
}
```

**When called:**
- On app launch when user is authenticated (`GlobalWorkedMusclesContext` useEffect)
- After every workout save (`refreshWorkedMuscles()` after `postWorkedMuscles`)

---

### POST – Update worked muscles

| Item | Value |
|------|-------|
| **URL** | `POST {baseUrl}/workedMuscles/api/` |
| **Example** | `POST http://192.168.86.25:8082/workedMuscles/api/` |
| **Headers** | `Authorization: Bearer <jwt>`, `Content-Type: application/json` |
| **includeSub** | `false` – we do NOT add `sub` to the body (backend expects only `userId`) |

**Request body (camelCase):**
```json
{
  "userId": "94986468-a081-70d5-d999-ef5244a5d74c",
  "exercises": [
    {
      "exerciseId": 1,
      "sets": 3,
      "reps": 10,
      "weight": 135
    }
  ]
}
```

**Field definitions:**

| Field | Type | Source |
|-------|------|--------|
| `userId` | string | `getCurrentUserSub()` – Cognito sub |
| `exercises` | array | Same array used in `createSessionLog` request |
| `exercises[].exerciseId` | number | Movement ID from `GET /movement/api/` |
| `exercises[].sets` | number | Count of completed sets |
| `exercises[].reps` | number | Reps from last completed set |
| `exercises[].weight` | number | Weight from last completed set (lbs) |

**Expected response:** `204 No Content`

**When called:** On every workout save (when `exercises.length > 0`), immediately after `createSessionLog` succeeds.

---

## 3. Movement / Exercise IDs

| Item | Value |
|------|-------|
| **Source** | `GET /movement/api/` |
| **Movement shape** | `{ id: number, name: string, areaOfActivation: string, description: string }` |
| **exerciseId** | Same as `Movement.id` |

**Resolving exerciseId:**
- User selects exercise by **name** (e.g. `"Barbell Bench Press"`)
- `getMovementId(name)` looks up in `movements` from Movement API
- Match: exact name, then case-insensitive trimmed
- Returns `Movement.id` as `exerciseId`

**Same exerciseId used for:**
1. `createSessionLog` request body
2. `postWorkedMuscles` request body

---

## 4. Muscle IDs (what frontend expects in GET response)

The muscle man expects **muscle IDs** (not canonical names like "Chest", "Arms").

### Front-view muscle IDs (frontWorked)

| ID | Aliases accepted |
|----|------------------|
| pecs | chest, pectoral |
| biceps | — |
| triceps | — |
| delts | — |
| abs | — |
| obliques | — |
| quads | quadriceps |
| calves | — |
| traps | — |
| forearms | outerforearms, innerforearms |

### Back-view muscle IDs (backWorked)

| ID | Aliases accepted |
|----|------------------|
| delts | shoulders |
| traps | trapezius |
| lats | latissimus |
| triceps | — |
| forearms | outerforearms, innerforearms |
| glutes | — |
| hamstrings | — |
| calves | — |
| obliques | — |

### areaOfActivation → muscle IDs mapping (for backend)

| areaOfActivation | frontWorked | backWorked |
|------------------|-------------|------------|
| Chest | pecs | — |
| Arms | biceps, triceps | triceps |
| Shoulders | delts | delts |
| Back | — | lats |
| Legs | quads | hamstrings, glutes |
| Glutes | — | glutes |
| Calves | calves | calves |
| Abs | abs | — |
| Core | obliques | obliques |
| Traps | — | traps |

---

## 5. Flow Summary

```
1. User completes workout on WorkoutStatsPage
2. handleSave() runs:
   a. Build exercises[] from stats.workouts (exerciseId from getMovementId(workoutName))
   b. createSessionLog({ timeSpentInGym, exercises })  → POST /sessionLog/api/
   c. postWorkedMuscles(exercises)                     → POST /workedMuscles/api/
   d. refreshWorkedMuscles()                           → GET /workedMuscles/api/{userId}
3. globalFrontWorked, globalBackWorked updated in context
4. MuscleManFront/Back receive frontWorked, backWorked via WorkedMusclesProvider
5. Muscle man highlights SVG paths matching those IDs
```

---

## 6. Files Reference

| File | Purpose |
|------|---------|
| `Services/workedMusclesApi.ts` | GET and POST API calls |
| `Services/apiConfig.ts` | Base URL, getCurrentUserSub, apiRequest |
| `Services/movementApi.ts` | GET movements, Movement interface |
| `Contexts/MovementContext.tsx` | movements[], getMovementId(name) |
| `Contexts/GlobalWorkedMusclesContext.tsx` | globalFrontWorked, globalBackWorked, refreshWorkedMuscles |
| `Contexts/UserContext.tsx` | userId (from getCurrentUserSub) |
| `MainPage/WorkoutStatsPage.tsx` | handleSave – builds exercises, calls createSessionLog, postWorkedMuscles, refreshWorkedMuscles |
| `Components/MuscleManFront.tsx` | GROUPS mapping, receives frontWorked |
| `Components/MuscleManBack.tsx` | GROUPS mapping, receives backWorked |
