/**
 * HireSapien v2.1 — SDE Sprint Tasks (Jira-style backlog)
 * Used in Sprint Planning stage — candidate must order and prioritize these.
 * Correct ordering reveals Engineering Planning competency.
 */

export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskStatus = "backlog" | "sprint" | "in-progress" | "in-review" | "done";
export type TaskType = "bug" | "feature" | "tech-debt" | "incident" | "docs";

export interface SprintTask {
  id: string;
  key: string;           // Jira-style: FIN-XXXX
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  points?: number;       // candidate sets this
  defaultPoints: number; // correct estimate (hidden from candidate)
  competencySignal: string;
  /** If this task is assigned to the candidate for implementation */
  isAssigned: boolean;
  /** Hint from tech lead (shown only if candidate reads the Slack thread) */
  techLeadHint?: string;
  acceptanceCriteria: string[];
}

export const SDE_BACKLOG: SprintTask[] = [
  {
    id: "task-1",
    key: "FIN-2847",
    title: "Fix: Payment gateway 504 timeout on Stripe webhooks",
    description:
      "Webhook handler is timing out on long-running Stripe events. Error rate: 12.4%. Affecting /webhook/stripe and /api/v2/checkout/complete. SLA breach imminent.",
    priority: "P0",
    type: "bug",
    defaultPoints: 8,
    competencySignal: "FeatureImplementation",
    isAssigned: true,
    techLeadHint: "Check the async queue timeout config in payment-gateway-service/config/queue.config.ts. It's set to 5s. Stripe timeout can be up to 30s per their docs.",
    acceptanceCriteria: [
      "Stripe webhook handler no longer times out on long-running events",
      "Queue timeout increased to 35s with retry on failure",
      "Error rate drops below 1% after fix deployment",
      "Existing retry logic in RetryQueue.ts is preserved",
      "Unit tests pass for WebhookHandler",
    ],
  },
  {
    id: "task-2",
    key: "FIN-2832",
    title: "Add structured logging to PaymentProcessor",
    description:
      "PaymentProcessor currently uses console.log. Replace with structured JSON logging via the shared Logger utility. Include transaction IDs in every log line.",
    priority: "P2",
    type: "tech-debt",
    defaultPoints: 3,
    competencySignal: "FeatureImplementation",
    isAssigned: false,
    acceptanceCriteria: [
      "All console.log replaced with Logger.info / Logger.error",
      "Transaction ID included in log context",
      "Log level configurable via environment variable",
    ],
  },
  {
    id: "task-3",
    key: "FIN-2851",
    title: "Write runbook for gateway timeout incidents",
    description:
      "Document the incident response steps for gateway timeout P1 events. Include metric thresholds, escalation paths, and rollback procedure.",
    priority: "P2",
    type: "docs",
    defaultPoints: 2,
    competencySignal: "DeliveryExcellence",
    isAssigned: false,
    acceptanceCriteria: [
      "Runbook added to Notion under Platform / Runbooks",
      "Covers: detection, investigation, fix, rollback",
      "Reviewed by one SDE and the Tech Lead",
    ],
  },
  {
    id: "task-4",
    key: "FIN-2845",
    title: "Upgrade Stripe SDK to v5.2.1",
    description:
      "Stripe SDK v5.2.1 includes webhook timeout improvements. This may partially address FIN-2847 but is NOT a full fix. Do not block FIN-2847 on this.",
    priority: "P2",
    type: "tech-debt",
    defaultPoints: 2,
    competencySignal: "EngineeringPlanning",
    isAssigned: false,
    acceptanceCriteria: [
      "stripe-sdk version bumped to 5.2.1 in package.json",
      "No breaking changes — verified via regression test suite",
      "Changelog reviewed for deprecations",
    ],
  },
  {
    id: "task-5",
    key: "FIN-2839",
    title: "Add retry metrics dashboard to Grafana",
    description:
      "Create a Grafana panel tracking retry attempts per minute for the WebhookHandler. Alert threshold: >50 retries/min.",
    priority: "P2",
    type: "feature",
    defaultPoints: 3,
    competencySignal: "TestingAndQuality",
    isAssigned: false,
    acceptanceCriteria: [
      "Grafana panel added to Platform / Payments dashboard",
      "Alert configured for >50 retries/min",
      "Metric backed by real retry_count gauge from WebhookHandler",
    ],
  },
  {
    id: "task-6",
    key: "FIN-2853",
    title: "Write integration tests for webhook retry logic",
    description:
      "RetryQueue.ts has no integration tests. Add test coverage for: max retries exceeded, partial failure handling, successful retry after timeout.",
    priority: "P2",
    type: "feature",
    defaultPoints: 5,
    competencySignal: "TestingAndQuality",
    isAssigned: false,
    acceptanceCriteria: [
      "3 integration tests added in WebhookHandler.test.ts",
      "All 3 tests pass in CI",
      "Coverage for RetryQueue.ts > 80%",
    ],
  },
];

/**
 * Optimal sprint selection and ordering for Engineering Planning scoring.
 * FIN-2847 (P0 bug) MUST be first.
 * FIN-2853 (tests) should follow the fix.
 * Documentation can be later in sprint.
 */
export const OPTIMAL_SPRINT_ORDER = ["task-1", "task-6", "task-2", "task-5", "task-3", "task-4"];
export const OPTIMAL_SPRINT_SELECTION = ["task-1", "task-6", "task-2", "task-5"]; // 4 core sprint tasks
export const MINIMUM_SPRINT_TASKS = 3;

/**
 * Score the candidate's sprint ordering (0-100).
 * Penalizes putting FIN-2847 anywhere other than first.
 * Rewards including FIN-2853 (tests) early in the sprint.
 */
export function scoreSprintOrdering(candidateOrder: string[]): number {
  if (candidateOrder.length === 0) return 0;

  let score = 100;

  // P0 bug must be first — heavy penalty if not
  const p0Index = candidateOrder.indexOf("task-1");
  if (p0Index === -1) return 0; // didn't include the P0 — automatic fail
  if (p0Index > 0) score -= p0Index * 20; // -20 per position off from first

  // Tests should be in the top half of the sprint
  const testIndex = candidateOrder.indexOf("task-6");
  if (testIndex !== -1 && testIndex > Math.ceil(candidateOrder.length / 2)) {
    score -= 10;
  }

  // Documentation tasks should not be before the bug fix
  const docIndex = candidateOrder.indexOf("task-3");
  if (docIndex !== -1 && docIndex < p0Index) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}
