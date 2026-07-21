/**
 * HireSapien v2.1 — SDE Evaluation Rubric
 * Per-task scoring criteria and evidence signal definitions.
 * Used by the evaluation engine to validate behavioral signals.
 */

export interface RubricCriterion {
  id: string;
  competencyKey: string;
  description: string;
  maxScore: number;
  /** Function to compute score from raw evidence */
  scorer: (evidence: Record<string, unknown>) => number;
}

export const SDE_RUBRIC: RubricCriterion[] = [
  {
    id: "sprint-ordering",
    competencyKey: "EngineeringPlanning",
    description: "P0 bug (FIN-2847) must be first; tests (FIN-2853) should be early.",
    maxScore: 100,
    scorer: ({ sprintScore }) => (typeof sprintScore === "number" ? sprintScore : 0),
  },
  {
    id: "fix-correctness",
    competencyKey: "FeatureImplementation",
    description: "Correct fix: increase webhook timeoutMs to 35000ms.",
    maxScore: 100,
    scorer: ({ selectedFix }) => {
      if (selectedFix === "fix-a") return 100; // correct
      if (selectedFix === "fix-b") return 15;  // dangerous (removes timeout)
      if (selectedFix === "fix-c") return 10;  // irrelevant (concurrency)
      return 0;
    },
  },
  {
    id: "incident-investigation",
    competencyKey: "InvestigationDebugging",
    description: "Must view metrics AND logs AND identify correct root cause.",
    maxScore: 100,
    scorer: ({ metricsViewed, logsScrolled, rootCause }) => {
      const mv = Array.isArray(metricsViewed) ? metricsViewed.length : 0;
      const metricScore = Math.min(40, mv * 14);
      const logScore = logsScrolled ? 20 : 0;
      const rootScore = rootCause === "rc-a" ? 40 : 0;
      return metricScore + logScore + rootScore;
    },
  },
  {
    id: "pr-quality",
    competencyKey: "EngineeringCommunication",
    description: "PR description must address: what, why, how to verify, risk.",
    maxScore: 100,
    scorer: ({ prDescription }) => {
      if (typeof prDescription !== "string") return 0;
      let score = 0;
      if (prDescription.length >= 80) score += 20;
      if (prDescription.length >= 200) score += 20;
      if (/timeout|5000|35000|stripe/i.test(prDescription)) score += 20;
      if (/test|verify|validate/i.test(prDescription)) score += 20;
      if (/risk|rollback|revert|monitor/i.test(prDescription)) score += 20;
      return Math.min(100, score);
    },
  },
  {
    id: "team-communication",
    competencyKey: "EngineeringCommunication",
    description: "Slack message: incident summary, root cause, fix applied, next steps.",
    maxScore: 100,
    scorer: ({ slackMessage }) => {
      if (typeof slackMessage !== "string") return 0;
      let score = 0;
      if (slackMessage.length >= 50) score += 20;
      if (slackMessage.length >= 150) score += 20;
      if (/timeout|gateway|fix|patch/i.test(slackMessage)) score += 20;
      if (/root cause|issue|problem/i.test(slackMessage)) score += 20;
      if (/monitoring|watching|resolved|deployed/i.test(slackMessage)) score += 20;
      return Math.min(100, score);
    },
  },
  {
    id: "delivery-completeness",
    competencyKey: "DeliveryExcellence",
    description: "All deliverables submitted: fix applied, tests run, PR created, team notified.",
    maxScore: 100,
    scorer: ({ selectedFix, testsRun, prDescription, slackMessage, sprintNotes }) => {
      let score = 0;
      if (selectedFix) score += 25;
      if (testsRun) score += 25;
      if ((prDescription as string)?.length >= 80) score += 25;
      if ((slackMessage as string)?.length >= 50) score += 15;
      if ((sprintNotes as string)?.length >= 60) score += 10;
      return Math.min(100, score);
    },
  },
];
