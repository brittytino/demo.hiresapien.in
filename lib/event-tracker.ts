/**
 * HireSapien v2.1 — Centralized Telemetry Event Tracker
 *
 * Every user action in the workspace emits a typed event here.
 * Events are flushed to the DB via /api/simulation/event endpoint.
 *
 * Anti-gaming guards:
 * - Idle detection: ≥30s without scroll or click in the workspace = idle_detected
 * - Prompt spam: ≥3 prompts within 60s with >0.85 string similarity = prompt_spam_flag
 * - Idle-without-scroll: dwell time on a tab without scroll evidence never scores positively
 */

import type { CompetencyKey } from "@/lib/evaluation/competency-framework";

export type EventType =
  | "doc_opened"
  | "doc_scrolled"
  | "ac_marked"
  | "req_tab_time"
  | "task_ordered"
  | "story_points_set"
  | "task_added"
  | "sprint_started"
  | "file_opened"
  | "folder_opened"
  | "nav_efficiency"
  | "file_time"
  | "log_inspected"
  | "metric_clicked"
  | "root_identified"
  | "debug_time"
  | "fix_applied"
  | "task_completed"
  | "approach_quality"
  | "approach_changed"
  | "api_configured"
  | "db_op_correct"
  | "validation_added"
  | "test_run"
  | "test_reviewed"
  | "fix_retried"
  | "coverage_noted"
  | "pr_submitted"
  | "slack_sent"
  | "comment_added"
  | "idle_detected"
  | "task_pace"
  | "prompt_submitted"
  | "prompt_quality"
  | "ai_verified"
  | "prompt_spam_flag"
  | "self_initiated"
  | "sprint_note_added"
  | "nav_click"
  | "tab_visited"
  | "stage_entered"
  | "stage_completed";

export interface WorkspaceEvent {
  type: EventType;
  timestamp: number;         // unix ms
  attemptId: string;
  stage: string;
  /** Numeric value where applicable (score, duration, count, etc.) */
  value?: number;
  /** Contextual payload */
  payload?: Record<string, unknown>;
  /** Competency keys this event directly signals */
  competencySignals: CompetencyKey[];
}

// ── Event → Competency Signal Map ──────────────────────────────────────
// Single source of truth — ensures every event type has an assigned competency.

export const EVENT_COMPETENCY_MAP: Record<EventType, CompetencyKey[]> = {
  doc_opened:          ["RequirementUnderstanding"],
  doc_scrolled:        ["RequirementUnderstanding"],
  ac_marked:           ["RequirementUnderstanding"],
  req_tab_time:        ["RequirementUnderstanding"],
  task_ordered:        ["EngineeringPlanning"],
  story_points_set:    ["EngineeringPlanning"],
  task_added:          ["EngineeringPlanning"],
  sprint_started:      ["EngineeringPlanning"],
  file_opened:         ["CodebaseNavigation"],
  folder_opened:       ["CodebaseNavigation"],
  nav_efficiency:      ["CodebaseNavigation", "Productivity"],
  file_time:           ["CodebaseNavigation"],
  log_inspected:       ["InvestigationDebugging"],
  metric_clicked:      ["InvestigationDebugging"],
  root_identified:     ["InvestigationDebugging"],
  debug_time:          ["InvestigationDebugging", "Productivity"],
  fix_applied:         ["FeatureImplementation"],
  task_completed:      ["FeatureImplementation", "DeliveryExcellence"],
  approach_quality:    ["FeatureImplementation"],
  approach_changed:    ["EngineeringBehavior"],
  api_configured:      ["APIAndDatabaseIntegration"],
  db_op_correct:       ["APIAndDatabaseIntegration"],
  validation_added:    ["APIAndDatabaseIntegration"],
  test_run:            ["TestingAndQuality", "DeliveryExcellence"],
  test_reviewed:       ["TestingAndQuality"],
  fix_retried:         ["TestingAndQuality", "EngineeringBehavior"],
  coverage_noted:      ["TestingAndQuality"],
  pr_submitted:        ["EngineeringCommunication", "DeliveryExcellence"],
  slack_sent:          ["EngineeringCommunication", "DeliveryExcellence"],
  comment_added:       ["EngineeringCommunication"],
  idle_detected:       ["Productivity"],
  task_pace:           ["Productivity"],
  prompt_submitted:    ["AICollaboration"],
  prompt_quality:      ["AICollaboration"],
  ai_verified:         ["AICollaboration"],
  prompt_spam_flag:    ["AICollaboration"],
  self_initiated:      ["EngineeringBehavior"],
  sprint_note_added:   ["DeliveryExcellence"],
  nav_click:           ["CodebaseNavigation", "Productivity"],
  tab_visited:         ["CodebaseNavigation"],
  stage_entered:       ["Productivity"],
  stage_completed:     ["DeliveryExcellence"],
};

// ── In-memory event queue (flushed periodically) ────────────────────────

let eventQueue: WorkspaceEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let lastActivityTime = Date.now();
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_THRESHOLD_MS = 30_000; // 30 seconds

// ── Prompt spam guard ───────────────────────────────────────────────────
const recentPrompts: { text: string; time: number }[] = [];
const SPAM_WINDOW_MS = 60_000;
const SPAM_SIMILARITY_THRESHOLD = 0.85;
const SPAM_COUNT_THRESHOLD = 3;

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const matches = shorter.split("").filter((c, i) => longer[i] === c).length;
  return matches / longer.length;
}

function checkPromptSpam(text: string): boolean {
  const now = Date.now();
  const windowedPrompts = recentPrompts.filter(p => now - p.time < SPAM_WINDOW_MS);
  const spamCount = windowedPrompts.filter(p => stringSimilarity(p.text, text) > SPAM_SIMILARITY_THRESHOLD).length;
  recentPrompts.push({ text, time: now });
  // Clean old entries
  recentPrompts.splice(0, recentPrompts.findIndex(p => now - p.time < SPAM_WINDOW_MS));
  return spamCount >= SPAM_COUNT_THRESHOLD;
}

// ── Core tracking function ──────────────────────────────────────────────

export function trackEvent(
  type: EventType,
  attemptId: string,
  stage: string,
  value?: number,
  payload?: Record<string, unknown>
): void {
  // Reset idle timer on any activity
  lastActivityTime = Date.now();
  if (idleTimer) clearTimeout(idleTimer);
  if (typeof window !== "undefined") {
    idleTimer = setTimeout(() => {
      // User has been idle for 30s — emit idle event
      trackEvent("idle_detected", attemptId, stage, IDLE_THRESHOLD_MS);
    }, IDLE_THRESHOLD_MS);
  }

  // Prompt spam check
  if (type === "prompt_submitted" && payload?.text && typeof payload.text === "string") {
    if (checkPromptSpam(payload.text)) {
      // Also emit spam flag alongside the prompt event
      void emitEvent({ type: "prompt_spam_flag", timestamp: Date.now(), attemptId, stage, value: 1, competencySignals: ["AICollaboration"] });
    }
  }

  const competencySignals = EVENT_COMPETENCY_MAP[type] ?? [];
  const event: WorkspaceEvent = {
    type, timestamp: Date.now(), attemptId, stage, value, payload, competencySignals,
  };

  eventQueue.push(event);

  // Flush every 5 events or after 3 seconds
  if (eventQueue.length >= 5) {
    void flushEvents(attemptId);
  } else {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => void flushEvents(attemptId), 3_000);
  }
}

async function emitEvent(event: WorkspaceEvent): Promise<void> {
  eventQueue.push(event);
}

async function flushEvents(attemptId: string): Promise<void> {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];

  try {
    await fetch("/api/simulation/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, events: batch }),
    });
  } catch {
    // Re-queue on failure (best-effort telemetry)
    eventQueue = [...batch, ...eventQueue];
  }
}

/** Force-flush all queued events immediately (call on stage completion) */
export async function flushAllEvents(attemptId: string): Promise<void> {
  if (flushTimer) clearTimeout(flushTimer);
  await flushEvents(attemptId);
}

/** Get the current event queue length (for debugging) */
export function getQueueLength(): number {
  return eventQueue.length;
}
