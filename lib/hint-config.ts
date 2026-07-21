import { BRANDING } from "@/lib/branding";

export interface TaskHint {
  h1: string;
  h2: string;
}

export const TASK_HINTS: Record<string, TaskHint> = {
  // ── Mission 1 ────────────────────────────────────────────────────────────
  "task-1-1": {
    h1: "Think about where the money actually moves — start upstream, with the people doing the buying, before chasing internal metrics.",
    h2: "Revenue declines rarely start with internal operations. Ask: has anything changed about how customers interact with the product?",
  },
  "task-1-2": {
    h1: "You need metrics that directly link customer behavior to revenue — not anything that happens inside the company.",
    h2: "Three of these six options tell you whether customers are engaging and converting. Two are internal costs. One is about traffic, not purchasing intent.",
  },
  "task-1-3": {
    h1: "A useful problem statement names who is affected and what changed — not who is to blame.",
    h2: "The CEO needs to know which part of the customer base or funnel changed. Look for the option that names a group or behavior specifically.",
  },

  // ── Mission 2 ────────────────────────────────────────────────────────────
  "task-2-1": {
    h1: "Look at which metric is out of proportion with the others — traffic is nearly flat, but something else has moved dramatically.",
    h2: "When visits are stable but revenue fell sharply, the metric between them — the one that converts visits into orders — is where the story is.",
  },
  "task-2-2": {
    h1: "Avoid any option that blames traffic or orders directly — check the dashboard again for what actually stayed flat.",
    h2: "A non-technical stakeholder needs a phrase that captures the 'visits are fine but buying isn't' dynamic — look for that framing.",
  },
  "task-2-3": {
    h1: "The right metric is the one you already identified as the anomaly. Double-clicking means breaking it down further.",
    h2: "Ignore any metric that doesn't appear in the dashboard data or relates to internal spending — the signal is already visible in the data you have.",
  },

  // ── Mission 3 ────────────────────────────────────────────────────────────
  "task-3-1": {
    h1: "Compare each segment's conversion numbers — one group has a dramatically different drop rate from the others.",
    h2: "The segment that changed most between Q1 and Q2 is your answer. Look at which device/channel group saw the sharpest conversion decline.",
  },
  "task-3-2": {
    h1: "Rank by closeness to the problem you just identified — the path that gets you to the root cause fastest should come first.",
    h2: "Since the issue is in a specific interface, start with that interface's performance before expanding outward to campaigns or catalog.",
  },
  "task-3-3": {
    h1: "Facts are only things you can read directly from the data — not inferences or explanations for why something happened.",
    h2: "Two options describe observable numbers from the segment query. The others add interpretation ('relatively stable', 'concentrated') that may not be confirmed by the data you have.",
  },

  // ── Mission 4 ────────────────────────────────────────────────────────────
  "task-4-1": {
    h1: "Find the metric that most directly causes a customer to abandon a purchase, not one that describes slowness or complaints generally.",
    h2: "Delivery complaints and on-time rates describe problems. One metric directly measures customer decisions made because of those problems.",
  },
  "task-4-2": {
    h1: "You need metrics that show the delivery system got worse — not metrics that describe downstream effects like revenue.",
    h2: "Two of these options describe operational performance specifically (rate and complaint volume). The other two describe business outcomes, not delivery performance.",
  },
  "task-4-3": {
    h1: "Consider how many separate pieces of evidence point to the same direction before setting your confidence level.",
    h2: "You have cancellation data, complaint data, and on-time delivery data all pointing the same way. Let that convergence guide your confidence level.",
  },

  // ── Mission 5 ────────────────────────────────────────────────────────────
  "task-5-1": {
    h1: "Look for the themes that appear across many customers, not just one or two — you want systemic complaints, not edge cases.",
    h2: "Two themes come up repeatedly in the tickets and directly tie back to the delivery data you already analyzed. The others are mentioned less or relate to a different problem.",
  },
  "task-5-2": {
    h1: "Prioritize whatever addresses the complaints customers mentioned most — start with the most frequent pain point.",
    h2: "Customers named two delivery-related issues. The fix that addresses what they complained about most should sit at the top.",
  },

  // ── Mission 6 ────────────────────────────────────────────────────────────
  "task-6-1": {
    h1: "Look at the Delivery Duration column specifically — are all values the right type and a realistic number of days?",
    h2: "Two rows have values in the Duration column that cannot represent real delivery times — one is the wrong data type, one is physically impossible.",
  },
  "task-6-2": {
    h1: "Think about what happens to the boardroom presentation if the underlying data contains errors — what's the professional response?",
    h2: "The safest and most defensible action is to fix problems before presenting, not after. Which option best describes that practice?",
  },

  // ── Mission 7 ────────────────────────────────────────────────────────────
  "task-7-1": {
    h1: "Your investigation gave you a root cause. The initiative that directly fixes that root cause should come first.",
    h2: "The evidence pointed to a specific operational failure. Rank the initiative that fixes that failure at the top, before any marketing or cost-cutting.",
  },
  "task-7-2": {
    h1: "Match the recommended team to the root cause you identified in the investigation — which team owns that problem?",
    h2: "The root cause was an operational issue, not a marketing or cost problem. Which team's domain covers the specific failure you found?",
  },
  "task-7-3": {
    h1: "Think about what 'balanced' means here — your primary fix shouldn't consume the entire budget, because you have secondary issues too.",
    h2: "The delivery problem is your top priority but not your only one. A range of 35–45 out of 100 reflects giving it strong priority while keeping budget for app and communication improvements.",
  },

  // ── Mission 8 ────────────────────────────────────────────────────────────
  "task-8-1": {
    h1: "The right conclusion names both WHO is affected and WHAT operational factor is driving it — look for specificity.",
    h2: "Your evidence named a specific customer type and a specific operational metric. The best conclusion option links both of them together.",
  },
  "task-8-2": {
    h1: "Think about sequencing: you can't market to new users if the core experience is still broken. Fix first, then communicate, then grow.",
    h2: "Delivery is the engine. Communication is the dashboard. App experience is the interface. New marketing only makes sense once the engine works.",
  },
  "task-8-3": {
    h1: `What does the evidence say should happen before ${BRANDING.companyName} tries to grow? What's the risk of investing in growth before fixing the root cause?`,
    h2: "Acquiring new users into a broken experience wastes spend. The CEO needs to hear: fix the core problem, then invest in growth.",
  },
};

/**
 * Returns hints for a given taskId, or null if no hints exist for that task.
 */
export function getHintsForTask(taskId: string): TaskHint | null {
  return TASK_HINTS[taskId] ?? null;
}
