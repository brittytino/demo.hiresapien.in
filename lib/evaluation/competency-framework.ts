/**
 * HireSapien v2.1 — 12-Competency Framework
 * Every competency score is backed by observable user actions — never by assumption.
 * Evidence signals map exactly to event types emitted by lib/event-tracker.ts
 */

export type CompetencyKey =
  | "RequirementUnderstanding"
  | "EngineeringPlanning"
  | "CodebaseNavigation"
  | "InvestigationDebugging"
  | "FeatureImplementation"
  | "APIAndDatabaseIntegration"
  | "TestingAndQuality"
  | "EngineeringCommunication"
  | "Productivity"
  | "AICollaboration"
  | "EngineeringBehavior"
  | "DeliveryExcellence";

export interface EvidenceSignal {
  /** Event type from event-tracker */
  eventType: string;
  /** How this event contributes to the competency (0-1 weight within competency) */
  weight: number;
  /** Description for the evidence trail in the report */
  label: string;
  /** Whether higher values are better (false = lower is better, e.g. idle time) */
  higherIsBetter: boolean;
}

export interface CompetencyDefinition {
  key: CompetencyKey;
  label: string;
  description: string;
  /** What we're actually measuring — observable actions, not traits */
  evidenceBasis: string;
  signals: EvidenceSignal[];
  /** Whether this competency requires AI evaluation of an artifact */
  requiresAIEval: boolean;
  /** Warning: Engineering Behavior traits must always include evidence trail in report */
  requiresEvidenceTrail: boolean;
}

export const COMPETENCY_FRAMEWORK: Record<CompetencyKey, CompetencyDefinition> = {
  RequirementUnderstanding: {
    key: "RequirementUnderstanding",
    label: "Requirement Understanding",
    description: "Systematically reads and identifies acceptance criteria before acting.",
    evidenceBasis:
      "Time spent on requirement docs, number of docs opened, ACs identified, scroll depth — NOT idle dwell time alone.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "doc_opened",   weight: 0.30, label: "Opened requirement document", higherIsBetter: true },
      { eventType: "ac_marked",    weight: 0.35, label: "Marked acceptance criteria", higherIsBetter: true },
      { eventType: "doc_scrolled", weight: 0.20, label: "Scrolled through specification", higherIsBetter: true },
      { eventType: "req_tab_time", weight: 0.15, label: "Active time on requirements tab (with scroll evidence)", higherIsBetter: true },
    ],
  },

  EngineeringPlanning: {
    key: "EngineeringPlanning",
    label: "Engineering Planning",
    description: "Logical task sequencing and sprint organization before implementation.",
    evidenceBasis:
      "Order of tasks added to sprint, story point estimates, task prioritization pattern.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "task_ordered",     weight: 0.45, label: "Sprint task ordering quality", higherIsBetter: true },
      { eventType: "story_points_set", weight: 0.25, label: "Set story point estimates", higherIsBetter: true },
      { eventType: "task_added",       weight: 0.20, label: "Added tasks to sprint", higherIsBetter: true },
      { eventType: "sprint_started",   weight: 0.10, label: "Started sprint with adequate tasks", higherIsBetter: true },
    ],
  },

  CodebaseNavigation: {
    key: "CodebaseNavigation",
    label: "Codebase Navigation",
    description: "Efficient exploration of the codebase to locate relevant files.",
    evidenceBasis:
      "Files reviewed, folders explored, navigation path efficiency, time to reach target file.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "file_opened",    weight: 0.35, label: "Files explored in codebase", higherIsBetter: true },
      { eventType: "folder_opened",  weight: 0.20, label: "Directories navigated", higherIsBetter: true },
      { eventType: "nav_efficiency", weight: 0.30, label: "Navigation path efficiency", higherIsBetter: true },
      { eventType: "file_time",      weight: 0.15, label: "Time on relevant source files", higherIsBetter: true },
    ],
  },

  InvestigationDebugging: {
    key: "InvestigationDebugging",
    label: "Investigation & Debugging",
    description: "Systematic inspection of logs, metrics, and evidence to locate root cause.",
    evidenceBasis:
      "Logs inspected, metric panels clicked, debug hypothesis steps, time to identify root cause.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "log_inspected",   weight: 0.30, label: "Error logs examined", higherIsBetter: true },
      { eventType: "metric_clicked",  weight: 0.25, label: "Metric panels investigated", higherIsBetter: true },
      { eventType: "root_identified", weight: 0.30, label: "Root cause identified correctly", higherIsBetter: true },
      { eventType: "debug_time",      weight: 0.15, label: "Time efficiency on incident", higherIsBetter: false },
    ],
  },

  FeatureImplementation: {
    key: "FeatureImplementation",
    label: "Feature Implementation",
    description: "Quality and correctness of engineering decisions and task completion.",
    evidenceBasis:
      "Fix selection quality, code approach, completion of assigned task, workflow pattern.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "fix_applied",       weight: 0.45, label: "Correct fix applied", higherIsBetter: true },
      { eventType: "task_completed",    weight: 0.30, label: "Task completed successfully", higherIsBetter: true },
      { eventType: "approach_quality",  weight: 0.25, label: "Engineering approach quality", higherIsBetter: true },
    ],
  },

  APIAndDatabaseIntegration: {
    key: "APIAndDatabaseIntegration",
    label: "API & Database Integration",
    description: "Correct configuration of endpoints, database operations, and validation.",
    evidenceBasis:
      "Endpoint selection, DB operation correctness, validation logic applied.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "api_configured",    weight: 0.40, label: "API endpoint configured correctly", higherIsBetter: true },
      { eventType: "db_op_correct",     weight: 0.35, label: "Database operation correct", higherIsBetter: true },
      { eventType: "validation_added",  weight: 0.25, label: "Input validation applied", higherIsBetter: true },
    ],
  },

  TestingAndQuality: {
    key: "TestingAndQuality",
    label: "Testing & Quality",
    description: "Test execution, validation behavior, and coverage awareness.",
    evidenceBasis:
      "Tests executed, test results reviewed, validation steps completed.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "test_run",        weight: 0.40, label: "Tests executed", higherIsBetter: true },
      { eventType: "test_reviewed",   weight: 0.30, label: "Test results reviewed", higherIsBetter: true },
      { eventType: "fix_retried",     weight: 0.20, label: "Retried after test failure", higherIsBetter: true },
      { eventType: "coverage_noted",  weight: 0.10, label: "Coverage noted before submit", higherIsBetter: true },
    ],
  },

  EngineeringCommunication: {
    key: "EngineeringCommunication",
    label: "Engineering Communication",
    description: "Quality of PR descriptions, status updates, and stakeholder communication.",
    evidenceBasis:
      "AI-evaluated PR description, Slack update content, communication clarity and completeness.",
    requiresAIEval: true,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "pr_submitted",     weight: 0.45, label: "PR description quality (AI-eval)", higherIsBetter: true },
      { eventType: "slack_sent",       weight: 0.35, label: "Stakeholder update quality (AI-eval)", higherIsBetter: true },
      { eventType: "comment_added",    weight: 0.20, label: "Code review comments clarity", higherIsBetter: true },
    ],
  },

  Productivity: {
    key: "Productivity",
    label: "Productivity",
    description: "Task completion efficiency — passive signal derived from timing and navigation patterns.",
    evidenceBasis:
      "Idle time (penalizes), navigation efficiency, task completion rate. Idle time alone never scores positively.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "idle_detected",  weight: 0.40, label: "Idle periods (penalizes)", higherIsBetter: false },
      { eventType: "nav_efficiency", weight: 0.35, label: "Navigation efficiency", higherIsBetter: true },
      { eventType: "task_pace",      weight: 0.25, label: "Task completion pace", higherIsBetter: true },
    ],
  },

  AICollaboration: {
    key: "AICollaboration",
    label: "AI Collaboration",
    description: "Effective use of AI assistant — prompt quality, refinement, verification behavior.",
    evidenceBasis:
      "Prompt quality score, refinement count, verification after AI response. Spam detection active.",
    requiresAIEval: true,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "prompt_submitted",   weight: 0.30, label: "AI prompts submitted", higherIsBetter: true },
      { eventType: "prompt_quality",     weight: 0.40, label: "Prompt quality (specificity, context)", higherIsBetter: true },
      { eventType: "ai_verified",        weight: 0.20, label: "Verified AI output before using", higherIsBetter: true },
      { eventType: "prompt_spam_flag",   weight: 0.10, label: "Repeated near-identical prompts (penalizes)", higherIsBetter: false },
    ],
  },

  EngineeringBehavior: {
    key: "EngineeringBehavior",
    label: "Engineering Behavior",
    description:
      "Inferred behavioral traits: ownership, persistence, adaptability. EVERY trait must be paired with its specific evidence trail.",
    evidenceBasis:
      "Persistence: retry count on failures. Ownership: self-initiated next steps. Adaptability: approach changes after setbacks.",
    requiresAIEval: false,
    requiresEvidenceTrail: true, // MANDATORY — spec constraint
    signals: [
      { eventType: "fix_retried",      weight: 0.35, label: "Persistence: retried after failure", higherIsBetter: true },
      { eventType: "self_initiated",   weight: 0.35, label: "Ownership: self-started next action", higherIsBetter: true },
      { eventType: "approach_changed", weight: 0.30, label: "Adaptability: changed approach after setback", higherIsBetter: true },
    ],
  },

  DeliveryExcellence: {
    key: "DeliveryExcellence",
    label: "Delivery Excellence",
    description: "Completeness of deliverables — PR submitted, docs updated, team notified.",
    evidenceBasis:
      "All expected deliverables submitted: PR, test run, stakeholder update, sprint notes.",
    requiresAIEval: false,
    requiresEvidenceTrail: false,
    signals: [
      { eventType: "pr_submitted",      weight: 0.35, label: "Pull request submitted", higherIsBetter: true },
      { eventType: "test_run",          weight: 0.25, label: "Tests run before submission", higherIsBetter: true },
      { eventType: "slack_sent",        weight: 0.20, label: "Team notified", higherIsBetter: true },
      { eventType: "sprint_note_added", weight: 0.20, label: "Sprint review notes added", higherIsBetter: true },
    ],
  },
};

export const ALL_COMPETENCIES = Object.keys(COMPETENCY_FRAMEWORK) as CompetencyKey[];
