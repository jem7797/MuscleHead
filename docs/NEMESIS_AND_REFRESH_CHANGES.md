# Nemesis Feature & Refresh API – Implementation Summary

Documentation of changes implemented in this session (chat log).

---

## 1. AsyncStorage for Nemesis Persistence

**Problem:** Nemesis state was lost on app refresh because it lived only in React state.

**Solution:** Added `Services/nemesisStorage.ts` and wired it into `UserContext`.

### Files Changed
- `Services/nemesisStorage.ts` (new)
- `Contexts/UserContext.tsx`

### nemesisStorage API
| Function | Description |
|----------|-------------|
| `getNemesisSubIds()` | Read nemesis IDs from AsyncStorage |
| `setNemesisSubIds(ids)` | Write nemesis IDs to AsyncStorage |
| `clearNemesisSubIds()` | Clear nemesis from AsyncStorage |

### UserContext Integration
- **On update:** `setNemesisSubIds` persists to AsyncStorage whenever nemesis changes (add/remove)
- **On logout:** `clearProfile` clears nemesis state and AsyncStorage
- **On fetch:** When `fetchUserProfile` receives nemesis from the API, it persists to AsyncStorage

---

## 2. Nemesis from Initial User Mount Request

**Problem:** Nemesis was loaded from AsyncStorage on mount instead of using the API response. 

**Solution:** Removed AsyncStorage preload on mount. Nemesis is now set only from the API response when `fetchUserProfile` runs.

### Changes
- Removed `getNemesisSubIds()` preload from the mount `useEffect`
- Nemesis is populated from `fetchUserProfile` → `getUser` / `getCurrentUserProfile` response

---

## 3. API Response Shape for Nemesis

**Problem:** Backend returns nemesis as `nemesis` (array of objects), not `nemesisSubIds` or `nemesis_sub_ids`.

**Response shape:**
```json
{
  "sub_id": "...",
  "username": "jordan7797",
  "nemesis": [
    {
      "subId": "54e8c448-...",
      "username": "jordan75",
      "profilePicUrl": "..."
    }
  ]
}
```

### Changes in `UserContext.tsx`
- Parse `userData.nemesis` first, then fall back to `nemesisSubIds` / `nemesis_sub_ids`
- Extract `subId` from each nemesis object for the `nemesisSubIds` array

```javascript
const nemesisRaw = userData.nemesis ?? userData.nemesisSubIds ?? userData.nemesis_sub_ids ?? [];
const ids = nemesisRaw.map((item) => 
  typeof item === "string" ? item : (item?.subId ?? "")
).filter(Boolean);
```

---

## 4. Red Button Issue (Nemesis Stays Red After Remove)

**Problem:** The nemesis button stayed red after removing someone as a nemesis.

**Solutions implemented:**

### A. ID normalization
- Added `normalizeId(id)` helper: `String(id).trim().toLowerCase()`
- Used for all nemesis ID comparisons (handles `sub_id` vs `subId`, casing, whitespace)

### B. Refresh API integration
- Added `GET /user/api/me` support (JWT-based, no subId needed)
- `refreshUserProfile()` uses this for the current user
- After successful `removeNemesis`, we call `refreshUserProfile()` to sync with the server

### C. Server as source of truth for remove
- Removed optimistic update on remove
- Flow: `removeNemesis` → `refreshUserProfile` → update state from `nemesis` in response
- On error: retry `refreshUserProfile()` to sync with server

---

## 5. New API: `GET /user/api/me`

**Purpose:** Fetch current user profile using JWT (no subId required).

### userApi.ts
```javascript
export const getCurrentUserProfile = async (): Promise<any> => {
  const response = await apiRequest("/user/api/me", { method: "GET" });
  return parseJsonResponse(response);
};
```

### UserContext
- When refreshing the current user (`id === userId`), `fetchUserProfile` calls `getCurrentUserProfile()` instead of `getUser(id)`
- `refreshUserProfile()` with no args uses `/me` for the logged-in user

### Usage
- Pull-to-refresh on profile screen
- After nemesis add/remove
- When returning to profile screen
- On login (via `refreshUserProfile(sub)` in LogIn)

---

## 6. File Summary

| File | Changes |
|------|---------|
| `Services/nemesisStorage.ts` | New – AsyncStorage helpers for nemesis |
| `Services/userApi.ts` | Added `getCurrentUserProfile()` for `/user/api/me` |
| `Contexts/UserContext.tsx` | Nemesis storage integration, `/me` for current user, `nemesis` response parsing |
| `Profile/UserProfileScreen.tsx` | `normalizeId`, remove flow uses refresh only, no optimistic update on remove |

---

## 7. Current Remove Nemesis Flow

1. User taps "Remove Nemesis" and confirms
2. Modal closes
3. `removeNemesis(currentUserId, subId)` – DELETE request
4. `refreshUserProfile()` – GET `/user/api/me`
5. `fetchUserProfile` parses `nemesis` from response
6. `setNemesisSubIdsInternal(ids)` + `persistNemesisSubIds(ids)`
7. Button reflects server state (gray = not nemesis)

---

## 8. Current Add Nemesis Flow

1. User taps nemesis button and confirms
2. Optimistic update: `setNemesisSubIds([...nemesisSubIds, subId])`
3. `updateUserNemesis(currentUserId, newList)` – PATCH request
4. On error: rollback to previous `nemesisSubIds`
