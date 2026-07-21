/**
 * HireSapien v2.1 — SDE Scenario Configuration
 * Company: Fintra Engineering (fictional B2B payment infrastructure company)
 * Role: Software Development Engineer I — Platform Team
 * Scenario: Production payment gateway timeout causing checkout failures
 */

export const SDE_SCENARIO = {
  id: "sde-fintra-payment-gateway-v1",
  version: "1.0.0",
  role: "sde",
  roleLabel: "Software Development Engineer",
  company: "Fintra Engineering",
  team: "Platform Infrastructure",
  manager: "Priya Anand",
  seniorPeer: "Marcus Cole",
  designLead: "Zara Osei",

  context: {
    sprint: "Sprint 22 — Week 2 of 2",
    sprintGoal: "Stabilize payment gateway reliability; improve P99 latency below 800ms.",
    candidateTitle: "SDE I",
    tenure: "Week 1 — Your first real sprint at Fintra.",
    teamSize: 6,
  },

  scenario: {
    title: "Gateway Timeout — Checkout Impact",
    severity: "P1",
    summary: `
      Fintra's payment gateway service has been returning HTTP 504 (Gateway Timeout)
      on 12% of checkout requests since a deployment at 09:14 UTC. The issue affects
      the Stripe webhook handler and is causing lost transactions for enterprise clients.
      Your task is to identify the root cause, apply a targeted fix, and get the service
      back to green — without breaking the existing retry logic.
    `.trim(),
    affectedService: "payment-gateway-service",
    errorRate: 12.4, // percent
    p99Latency: 2340, // ms
    affectedEndpoints: ["/webhook/stripe", "/api/v2/checkout/complete"],
    deploymentTrigger: "v2.14.1 — Added async queue for webhook processing",
  },

  offerLetter: {
    date: "Monday, 21 July 2026",
    body: `
Dear Candidate,

We are delighted to extend this offer for the position of Software Development Engineer I
on Fintra's Platform Infrastructure team.

Your first sprint has started. Your team needs you today.

Fintra processes $4.2B in annual payment volume for 1,200+ enterprise clients. 
Reliability is the product.

You will be working with:
  - Priya Anand (Engineering Manager) — your direct manager
  - Marcus Cole (Senior SDE) — your sprint buddy
  - Zara Osei (Tech Lead) — sets technical direction

Your first task is waiting in Jira. The sprint board is active.

Welcome to the team.

— Priya Anand
  Engineering Manager, Platform Infrastructure
  Fintra Engineering
    `.trim(),
  },

  onboarding: {
    tools: [
      { id: "jira",     name: "Jira",     icon: "tasks",    description: "Sprint board, backlog, task tracking" },
      { id: "github",   name: "GitHub",   icon: "code",     description: "Code review, PR submissions, repo browser" },
      { id: "vscode",   name: "VS Code",  icon: "terminal", description: "Primary code editor, integrated terminal" },
      { id: "slack",    name: "Slack",    icon: "message",  description: "Team comms, incident alerts, standup" },
      { id: "grafana",  name: "Grafana",  icon: "chart",    description: "Production metrics, error tracking, SLAs" },
      { id: "notion",   name: "Notion",   icon: "doc",      description: "Technical docs, runbooks, architecture" },
    ],
    teamMessages: [
      {
        from: "Marcus Cole",
        role: "Senior SDE",
        avatar: "MC",
        message: "Hey! Welcome to Platform. Today's a bit of a baptism by fire — we have a P1 on the payment gateway. Check Jira first, then ping me if you get stuck. You've got this.",
        time: "9:41 AM",
      },
      {
        from: "Priya Anand",
        role: "Engineering Manager",
        avatar: "PA",
        message: "Great to have you on the team. I've added you to the sprint. The Gateway Timeout issue is FIN-2847 — it's P1, so this is your first real priority. Marcus will be available if you need a pair-programming session.",
        time: "9:44 AM",
      },
      {
        from: "Zara Osei",
        role: "Tech Lead",
        avatar: "ZO",
        message: "TLDR on the architecture: payment-gateway-service handles all Stripe webhooks via an async queue introduced in v2.14.1. The queue has a default timeout of 5s but Stripe sometimes takes 8-12s. That's your starting hypothesis — look at the Grafana latency data first.",
        time: "9:52 AM",
      },
    ],
  },

  stages: [
    { id: "welcome",        label: "Offer Letter",       durationBudgetMs: 60_000  },
    { id: "onboarding",     label: "Company Onboarding", durationBudgetMs: 90_000  },
    { id: "sprint-planning",label: "Sprint Planning",    durationBudgetMs: 180_000 },
    { id: "implementation", label: "Implementation",     durationBudgetMs: 300_000 },
    { id: "incident",       label: "Incident Response",  durationBudgetMs: 180_000 },
    { id: "pr-review",      label: "PR & Communication", durationBudgetMs: 180_000 },
    { id: "sprint-review",  label: "Sprint Review",      durationBudgetMs: 120_000 },
  ],

  totalDurationMs: 1_110_000, // ~18.5 min ceiling
  coreDurationMs:  600_000,   // ~10 min core path
} as const;
