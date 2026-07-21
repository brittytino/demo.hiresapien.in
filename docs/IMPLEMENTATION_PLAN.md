# Data Scientist Industry Simulation (V3 - Full Stack API Wiring)

This plan covers the final steps required to transition the application from a static JSON-driven MVP to a fully functional, database-connected application ready for GitHub and production deployment.

## User Review Required

> [!IMPORTANT]
> **"A lightweight one like this"**: You mentioned "maybe a lightweight one like this will be better" in your last message. Were you referring to a specific design reference or screenshot that didn't attach? If so, please describe it! Otherwise, I will assume you mean keeping the current fast, minimal, and premium UI we just built.

> [!IMPORTANT]
> **Environment Variables**: I will create a `.env.local` file with placeholders for your `MONGO_URI` and `GEMINI_API_KEY`. You will need to fill these in locally before the database and AI evaluation will actually work.

---

## Proposed Changes

### 1. Environment Setup

#### [NEW] `.env.local`
- Create a `.env.local` file with the necessary variable keys (`MONGO_URI`, `GEMINI_API_KEY`) so you can easily plug in your credentials locally.

### 2. Frontend to Backend API Wiring

Currently, the UI is statically rendering the JSON. I will rewrite the simulation flow to actually communicate with the backend endpoints and maintain state.

#### [MODIFY] `app/simulation/intro/page.tsx`
- Convert to a Client Component (`"use client"`).
- Add a loading state to the "Start Assessment" button.
- On click, it will fetch the lead data from `localStorage` (saved during onboarding) and `POST` it to `/api/simulation/start`.
- It will receive an `attemptId` from the backend, store it in `localStorage`, and then redirect the user to `/simulation/mission/mission-1`.

#### [MODIFY] `app/simulation/mission/[id]/page.tsx`
- Convert to a Client Component (`"use client"`).
- Implement local React state to track the `currentTaskIndex`.
- When a user interacts with a component (e.g., selects an MCQ option) and clicks "Submit", it will `POST` their answer and the `attemptId` to `/api/simulation/submit-interaction`.
- Based on the API response (`nextTask`, `nextMission`, `isComplete`), the UI will seamlessly transition to the next task on the screen, or push the router to the next mission's URL, or push to the results page.

#### [MODIFY] `app/simulation/result/page.tsx`
- Convert to a Client Component.
- On mount, it will retrieve the `attemptId` from `localStorage` and `POST` to `/api/simulation/complete` to run the final weighted math algorithm.
- It will then render the final Readiness Score directly from the Database instead of using placeholder static data.

### 3. Final Verification
- I will run `npm run build` one last time to ensure no new errors were introduced by the client component wiring.
- The repository will be fully complete and ready to push to GitHub.

---

## Verification Plan
1. Local `.env.local` file is created.
2. The entire flow from Onboarding -> Hub -> Intro -> Mission Task 1 -> Mission Task 2 -> Results works flawlessly when interacting with the API logic.
