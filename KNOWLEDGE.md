# HireSapien & Fintra Simulation Project Knowledge Base 🧠

This document serves as the comprehensive repository guide for **HireSapien** (the candidate evaluation platform) and **Fintra Analytics Lab** (the interactive industry simulation platform). It is designed to help developer agents and human engineers explore and understand the codebase in detail.

---

## 1. Project Overview & Business Value 🚀
**HireSapien** is a premium, interactive simulation platform built to dynamically assess candidate suitability for business and data science roles. Instead of static MCQ tests, candidates are placed in high-fidelity business scenarios representing real-world challenges.

### Current Simulation Scenario: Fintra e-Commerce Churn Investigation
* **Client/Company**: **Fintra** (one of India's growing e-commerce platforms).
* **Role**: Junior Data Analyst / Data Scientist.
* **Context**: Revenue has declined by 18% over the past quarter, while customer complaints have increased by 12%. Under the guidance of Priya Sharma (Analytics Lead), the candidate must investigate the root cause of this decline and present remediation plans to the Executive Board.
* **Competencies Evaluated**:
  1. **Problem Framing**
  2. **Data Literacy / Data Interpretation**
  3. **Analytical Reasoning / Root Cause Analysis**
  4. **Prioritization / Decision Quality**
  5. **Business Thinking / Business Awareness**
  6. **Data Quality Awareness**
  7. **Communication**

---

## 2. Technical Stack 🛠
* **Frontend**: Next.js 16.1.6 (App Router), React 19, TailwindCSS v4, Lucide React icons.
* **Animations**: Framer Motion 12.38.0.
* **Charts & Plots**: Recharts 3.8.0.
* **Database & Persistence**: MongoDB via Mongoose 9.2.4 schemas.
* **AI Evaluation & APIs**: 
  - Google Gemini API (`@google/generative-ai` v0.24.1)
  - Anthropic Claude API (`@anthropic-ai/sdk` v0.39.0)
* **Reporting Utilities**: `jspdf` (PDF generation), `html-to-image`/`html2canvas` (visual layout capture), `xlsx` (Excel exports).
* **Testing Framework**: Vitest 4.1.2 (API/Unit) & Playwright 1.59.0 (E2E).

---

## 3. Directory Structure Map 📁

```bash
sonascale.hiresapien.com
├── .agents/                 # Workspace-scoped Customization Rules & Skills
│   ├── skills/              # Custom developer skills (e.g., hallmark)
│   └── AGENTS.md            # Agent loading instructions
├── app/                     # Next.js App Router Pages and Endpoints
│   ├── admin/               # Administrative Dashboard (Candidate tracking)
│   ├── api/                 # Backend endpoints
│   │   ├── beta-signup/     # Newsletter/early-access registration
│   │   ├── complete/        # Evaluation scoring and DB aggregation
│   │   ├── log-violation/   # Proctoring infractions recorder
│   │   ├── start/           # Candidate onboarding and attempt initialization
│   │   └── submit-interaction/ # Individual task response processing
│   ├── simulation/          # Simulation interface views
│   │   ├── churn-spike/     # Original standalone Churn Simulation Dashboard
│   │   ├── churn-spike-newcomer/ # Localized multi-step newcomer scenario
│   │   ├── intro/           # Role onboarding context layout
│   │   ├── mission/         # Dynamic simulation player Engine [id]
│   │   └── result/          # Final scoring reports & PDF export dashboard
│   └── sonascaledtatscientist/ # Candidate multi-step personality onboarding
│       ├── about/           # Contact information forms
│       ├── career/          # Role interests selection
│       ├── confidence/      # Tech/comfort sliders
│       ├── degree/          # Academic backgrounds
│       └── skills/          # Experience tags
├── components/              # Shared React UI components
│   ├── basic/               # Core components (Themes, tooltips, buttons)
│   └── simulation/          # Assessment components (Proctoring, hint buttons)
├── docs/                    # Architectural plans, walkthroughs, scoring specs
├── lib/                     # Data stores, utility functions, connection configs
├── models/                  # Mongoose MongoDB Schemas
└── scripts/                 # Seeding and API verification tools
```

---

## 4. Onboarding Funnel 📋
Before the simulation starts, candidates go through a personality and background questionnaire in `/app/sonascaledtatscientist`:
1. **About You** (`about/page.tsx`): Name, email, mobile phone, age, and gender.
2. **Degree** (`degree/page.tsx`): Academic stream (e.g. B.Tech, MBA), year of study, and degree status.
3. **Skills** (`skills/page.tsx`): Selectable technical and soft skills.
4. **Working Style** (`workingstyle/page.tsx`): Situation judgment questions.
5. **Confidence** (`confidence/page.tsx`): Self-rated comfort levels in statistics, programming, and databases.
6. **Expectations** (`expectations/page.tsx`): Career interests, expectations, and goals.

The data is saved to the candidate's profile during these transitions and is finally mapped to MongoDB schemas when the assessment initiates.

---

## 5. Mongoose Database Models (`/models`) 🗄
The MongoDB data schema is structured across five core collections:

### A. CandidateProfile (`CandidateProfile.ts`)
Stores demographic data, academic profile, self-assessments, and optional mailing list signups.
* **Fields**: `name`, `email`, `phone`, `age`, `gender`, `degree`, `academic_status`, `math_background`, `career_interest`, `skills`, `ws_q1`, `ws_q2`, `ws_q3`, `ds_familiarity`, `data_comfort`, `expectations`, `beta_signup`.

### B. SimulationAttempt (`SimulationAttempt.ts`)
Models a candidate's specific test run. Keeps track of timing, proctoring violations, and current progress status.
* **Fields**: `candidateId`, `status` (`"IN_PROGRESS" | "COMPLETED" | "TERMINATED"`), `randomizedMissions` (ordered queue of mission IDs), `warningCount` (number of proctoring infractions, max 5), `reattemptCount`, `startedAt`, `completedAt`, `timeTaken` (seconds).

### C. SimulationResponse (`SimulationResponse.ts`)
Records individual answers submitted for each task in the dynamic simulation.
* **Fields**: `candidateId`, `attemptId`, `taskId`, `missionId`, `interactionType`, `selectedOption`, `textValue`, `sliderValue`, `scoreEarned`, `maxScore` (always 100), `competenciesHit`.

### D. SimulationResult (`SimulationResult.ts`)
Maintains the final scores and AI summaries compiled once the simulation ends.
* **Fields**: `candidateId`, `attemptId`, `overallScore` (Quotient Match Score), `competencyScores` (Map of competency key to integer), `readinessLevel`, `archetype`, `strengths` (array), `improvements` (array).

### E. UserAccount (`UserAccount.ts`)
Manages system users and admins for accessing dashboard statistics.

---

## 6. Simulation Modes 🕹

### Mode 1: The Dynamic Mission Engine (`/simulation/mission/[id]`)
Generates assessment missions dynamically from a central config file: [simulation-data.json](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/simulation-data.json). 
* **Dynamic Components** (`components/simulation/InteractionComponents.tsx`):
  - **SingleSelect**: Choose one target.
  - **MultiSelect**: Select multiple matching options.
  - **Ranking** (`components/simulation/RankingUI.tsx`): Drag-and-drop elements to sort options.
  - **Slider**: Select numerical ratios or budget sliders.
  - **ShortText**: Qualitative text responses evaluated by LLMs.
* **Randomized Flow**: By default, attempts load a subset queue of missions (usually `["mission-3", "mission-4", "mission-5", "mission-6"]`) to measure performance.

### Mode 2: Standalone Churn Simulations (`/simulation/churn-spike` & `/churn-spike-newcomer`)
Self-contained, highly interactive Dashboards mapping the 5 stages of the Fintra payment gateway outage investigation:
1. **Stage 1 (Investigation)**: Interactive chart slicing of weekly churn metrics. Overlaying support tickets visually correlates a spike in week 12. Filtering narrows the outlier to the **SMB** segment and the **South East Asia (SEA)** region.
2. **Stage 2 (Interpretation)**: Candidates mark the exact outlier cell in the grid and write a hypothesis regarding the driver of the outage.
3. **Stage 3 (Decision)**: Allocation of a ₹10,00,000 emergency response budget between:
   - *Emergency Support Surge* (reduces backlog)
   - *Proactive Retention Discount* (holds customer renewals)
   - *Engineering Hotfix + Comms* (fixes the gateway bug)
4. **Stage 4 (Business Awareness)**: Cross-functional review. Leaders react based on the budget allocation. If support is under-funded (APAC Sales complains) or discounts are over-allocated (Finance VP complains), ratings drop.
5. **Stage 5 (Communication)**: Writing a concise 3-line executive brief explaining the what, why, and action plan under 300 characters.

---

## 7. Scoring & Evaluation Logic 📊
The platform uses a continuous 0-100 task scoring paradigm calculated by `/app/api/simulation/submit-interaction/route.ts` and `/app/api/simulation/complete/route.ts`.

### Task Score Rubrics
* **Single Select**: `Correct = 70`, `Incorrect = 0`.
* **Multi Select**: Proportional ratio based on hits vs misses:
  $$\text{Ratio} = \frac{\text{Hits} - \text{Wrong Choices}}{\text{Total Correct Answers}}$$
  $$\text{Base Score} = \text{round}(70 \times \text{Ratio})$$
* **Ranking**: Positional weight decay. Correct placements in top positions are worth more:
  $$\text{Position Weight} = N - \text{Index}$$
  Score is the ratio of earned weight vs max possible weight scaled to 70.
* **Slider**: Correct ranges get 60–70 depending on proximity to midpoint. Out-of-range allocations decay exponentially based on distance to limits.
* **Short Text**: Assessed via **Anthropic API (Claude)** or **Google API (Gemini)**. If keys are missing, falls back to a robust keyword regex match (`robustKeywordEvaluation`). If the text is gibberish/poor quality (verified via regex in `api-utils.ts`), it scores `0`.

### Modifiers, Bonuses & Penalties
* **Efficiency Bonus**: Speed rewards added to correct answers ($\ge 60$ base score):
  - Completed in $<30$s: **+15 points**
  - Completed in $<60$s: **+10 points**
  - Completed in $<120$s: **+5 points**
* **Depth / Perfection Bonus**: Position-perfect Rankings or flawless Multi-selects receive **+15 points**.
* **Hint Penalty**: **-10 points** per hint activated (max -20 limit).
* **Business Awareness Clamping**: Evaluated in Stage 3 budget allocations. A "Balanced Response" (Surge Support $\ge 20\%$ and Retention Discounts $\le 40\%$) awards **100 points**, while unbalanced responses drop to **55 points**.

### Final Calculations
The total Quotient Match Score is the weighted average of the 8 competencies configured in the JSON template:
$$\text{Quotient Match Score} = \sum \frac{\text{Competency Score} \times \text{Competency Weight}}{100}$$

#### Readiness Classification Bands
* **86 – 100**: High Potential Talent
* **71 – 85**: Industry Ready
* **56 – 70**: Emerging Professional
* **41 – 55**: Foundation Builder
* **0 – 40**: Explorer

---

## 8. Proctoring Guard Safeguards (`ProctoringGuard.tsx`) 🛡
A custom React component wrap protects the test environment from cheating:
1. **Window Focus Loss**: Detects tab-switching and window blurs, triggering warnings.
2. **Fullscreen Locks**: Enforces fullscreen mode. Exiting is flagged as an infraction.
3. **Developer Tools Hook**: Monitors discrepancies in inner vs outer window dimensions to flag open inspect tools.
4. **Inactivity Timer**: Detects 2 minutes of zero mouse/keyboard input and issues an alert.
5. **Key Preventions**: Prevents shortcut actions (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`, `Ctrl+F`, `Ctrl+W`, `Ctrl+T`, `Ctrl+N`, `F11`) and blocks copy-paste inside questions.
6. **Auto-Submit Penalty**: Reaching 5 warning violations triggers automatic submission of the test.
*Note: Proctoring enforcement is currently switched off in development via `isActiveExam = false`.*

---

## 9. Configuration Files of Note ⚙
1. [package.json](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/package.json): Lists builds, evaluation commands, dependencies.
2. [.env](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/.env) / `.env.local`: Connects MongoDB and registers API keys for Claude (`ANTHROPIC_API_KEY`) and Gemini (`GEMINI_API_KEY`).
3. [lib/branding.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/branding.ts): Provides application renaming overrides and local storage key definitions.
4. [lib/hint-config.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/hint-config.ts): Stores hints and mentoring templates for tasks.
5. [lib/simulation-data.json](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/simulation-data.json): Central metadata file feeding the dynamic simulation router questions and answers.

---

## 10. Development & Verification Commands 💻
* Run local dev server: `npm run dev`
* Clean database candidates: `npm run db:clean-users`
* Seed administrator account: `npm run db:seed-admin`
* Run API validations: `npm run test:api` (Vitest)
* Run End-to-End checks: `npm run test:e2e` (Playwright)
* Test AI model connection: `npm run test:gemini` or `npm run test:claude`
