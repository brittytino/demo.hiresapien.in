# HireSapien Workspace Customization Rules 🤖

These instructions apply to all AI coding agents working in this workspace.

---

## 1. Project Context & Reference
* This repository hosts **HireSapien**, a data-scientist and business associate simulation assessment platform.
* Before editing any files, writing scripts, or designing new flows, **you MUST read** [KNOWLEDGE.md](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/KNOWLEDGE.md) in the workspace root to understand the overall architecture, database models, proctoring rules, and grading metrics.

---

## 2. Core Architectural & Code Rules

### A. Database Connections
* Always import and use the connection wrapper `connectWithTimeout` from [lib/mongodb.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/mongodb.ts) with an appropriate timeout limit (e.g., 3000ms) rather than standard `mongoose.connect()`.
* Do not hardcode database URIs or passwords. Fall back to local memory simulation loops when `process.env.MONGO_URI` is absent.

### B. AI API Integrations & Fallbacks
* Qualitative short-text responses are evaluated using AI APIs.
* **Failsafe Rule**: Always ensure there is a fallback to a robust keyword regex match (`robustKeywordEvaluation`) if API keys (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) are missing or if the API calls time out, preventing candidate lockout.
* Reject gibberish input using the validation helpers in [lib/api-utils.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/api-utils.ts).

### C. Branding & Copy Sync
* Do not hardcode the organization name "Fintra" or platform name "HireSapien" in UI views. 
* Use the branding helper functions from [lib/branding.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/lib/branding.ts) (`formatBranding` and `getBrandedSimulationData`) to load strings dynamically.

### D. Scoring & Competencies integrity
* Do not alter the 0-100 continuous task scoring or the competency averaging mathematics in [complete/route.ts](file:///d:/IMPORTANT_FILES/PROJECT_FILES/sonascale.hiresapien.com/app/api/simulation/complete/route.ts) without explicit user instruction.
* Ensure bonus modifiers (efficiency, ranking depth) are correctly scaled when adding new tasks.

---

## 3. UI and Styling Standards
* Styling must align with the existing **TailwindCSS v4** configuration.
* Keep styling premium, using curated radial light effects, glassmorphism containers (`backdrop-blur`), and custom SVG loader animations.
* Maintain proctoring state integration with `ProctoringGuard.tsx`, ensuring that `isActiveExam` stays `false` in development but is ready for toggling in production.
