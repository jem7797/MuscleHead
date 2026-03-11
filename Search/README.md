# Search

User search, recent searches, and hidden-user fallback.

---

## What It Does

- **SearchMainPage** – Search bar, user results with Follow/Following/Requested, recent searches
- **HiddenSearchPage** – Shown when `privacySetting === "hidden"`; explains restrictions

---

## Key Files

| File | Purpose |
|------|---------|
| `SearchMainPage.tsx` | Search UI. Debounced search, pagination, follow state (followed + request pending). |
| `SearchMainPage Components/SearchBar.tsx` | Search input. |
| `SearchMainPage Components/UserSearchResults.tsx` | User list with Follow/Following/Requested. |
| `SearchMainPage Components/RecentSearches.tsx` | Recent searches; tap to go to profile. |
| `HiddenSearchPage.tsx` | Placeholder for hidden users. |

---

## Design Choices

### Debounced search

`SEARCH_DEBOUNCE_MS` (300ms) prevents a request on every keystroke. Search runs only when query length ≥ 2.

### Follow + request status per result

For each user we call `checkFollow` and `checkFollowRequestStatus`. That drives:
- **Follow** – Not following, no request
- **Requested** – Pending request (private user)
- **Following** – Already following

Same logic as UserProfileScreen and FollowListScreen.

### Recent searches in AsyncStorage

`recentSearchesService` stores recent searches locally. Tapping a user adds them and navigates to UserProfile. Keeps history without backend support.

### NavBar routes to HiddenSearch when hidden

Same pattern as Community → HiddenFeed. NavBar checks `privacySetting` and routes to hiddenSearch when the user is hidden.

---

## How It Connects to the Rest of the App

- **userApi** – `searchUsers`
- **followApi** – follow, unfollow, checkFollow, checkFollowRequestStatus
- **recentSearchesService** – getRecentSearches, addRecentSearch, clearRecentSearches
- **UserContext** – `userId`, `addToFollowingCount`, `feedInvalidationTrigger`, `privacySetting`
- **NavBar** – Search vs hiddenSearch routing
