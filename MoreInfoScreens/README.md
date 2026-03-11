# MoreInfoScreens

Post-signup onboarding: IdentityBasics → HeightWeight → ProfileSetUp. Collected data is sent to the backend in one `updateUser` call.

---

## What It Does

- **IdentityBasics** – Gender selection
- **HeightWeight** – Weight and height (feet/inches)
- **ProfileSetUp** – Privacy (public/friendsOnly/private), toggles (natty, show weight/height, stat tracking), finish

---

## Key Files

| File | Purpose |
|------|---------|
| `IdentityBasics.tsx` | Gender selector. Uses OnboardingContext. |
| `HeightWeight.tsx` | Weight and height pickers. Two-step (weight then height). |
| `ProfileSetUp.tsx` | Privacy dropdown, toggles. Validates, calls `updateUser` with onboarding data + Cognito attributes, navigates to WorkoutInputMainPage. |

---

## Design Choices

### OnboardingContext for multi-step flow

Data is written to OnboardingContext at each step. ProfileSetUp reads it and sends everything in one `updateUser`. This avoids passing large objects through navigation params and keeps the flow flexible.

### Backend requires Cognito attributes

`updateUser` needs email, first_name, username, birth_year from Cognito. ProfileSetUp fetches them with `fetchUserAttributes` and includes them in the payload. The user record must exist (created at signup); ProfileSetUp only updates it.

### Privacy options

- **Public** – Everyone can see profile, workouts, posts  
- **Friends Only** – Only people you follow  
- **Private** – Only you (request-to-follow flow)  
- **Hidden** – No feed/search/follow; user sees HiddenFeed/HiddenSearch

---

## How It Connects to the Rest of the App

- **OnboardingContext** – All collected data
- **userApi** – `updateUser`, `getUser`
- **apiConfig** – `getCurrentUserSub`
- **ContinueSignUp** – Navigates to IdentityBasics after email verification
- **SignUp** – Can pre-fill OnboardingContext (gender, height, weight) before verification
