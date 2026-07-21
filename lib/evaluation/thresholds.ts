/**
 * HireSapien v2.1 — Hiring Recommendation Thresholds
 * Fixed configuration constants — never LLM-decided.
 * Per-role calibration: multiply min scores by a role_modifier if needed.
 */

export const HIRING_THRESHOLDS = {
  STRONG_HIRE: {
    minScore: 85,
    noCompetencyBelow: 60,
    label: "Strong Hire",
    color: "oklch(65% 0.18 148)", // green
    description: "Exceptional engineering execution. Recommend fast-track to final round.",
  },
  HIRE: {
    minScore: 70,
    noCompetencyBelow: 50,
    label: "Hire",
    color: "oklch(57% 0.22 248)", // blue
    description: "Solid execution across key competencies. Standard hiring confidence.",
  },
  CONSIDER: {
    minScore: 55,
    noCompetencyBelow: 0,
    label: "Consider",
    color: "oklch(72% 0.18 76)", // amber
    description: "Mixed signals. Consider additional interview to verify gaps.",
  },
  NEEDS_DEVELOPMENT: {
    minScore: 35,
    noCompetencyBelow: 0,
    label: "Needs Development",
    color: "oklch(62% 0.22 22 / 0.8)", // soft red
    description: "Below threshold for this role. Recommend targeted coaching.",
  },
  NOT_READY: {
    minScore: 0,
    noCompetencyBelow: 0,
    label: "Not Ready",
    color: "oklch(62% 0.22 22)", // red
    description: "Significant gaps across multiple engineering competencies.",
  },
} as const;

export type HiringBand = keyof typeof HIRING_THRESHOLDS;

/**
 * Derive hiring band from execution score + competency floor check.
 * Returns the highest band the candidate qualifies for.
 */
export function getHiringBand(
  executionScore: number,
  competencyScores: Record<string, number>
): HiringBand {
  const minComp = Math.min(...Object.values(competencyScores));

  if (
    executionScore >= HIRING_THRESHOLDS.STRONG_HIRE.minScore &&
    minComp >= HIRING_THRESHOLDS.STRONG_HIRE.noCompetencyBelow
  ) return "STRONG_HIRE";

  if (
    executionScore >= HIRING_THRESHOLDS.HIRE.minScore &&
    minComp >= HIRING_THRESHOLDS.HIRE.noCompetencyBelow
  ) return "HIRE";

  if (executionScore >= HIRING_THRESHOLDS.CONSIDER.minScore) return "CONSIDER";
  if (executionScore >= HIRING_THRESHOLDS.NEEDS_DEVELOPMENT.minScore) return "NEEDS_DEVELOPMENT";
  return "NOT_READY";
}

/**
 * Dynamic classification cascade function.
 * Evaluates execution score and competency floors and returns the full band details.
 */
export function classify(
  executionScore: number,
  competencyScores: Record<string, number>
) {
  const band = getHiringBand(executionScore, competencyScores);
  return {
    band,
    ...HIRING_THRESHOLDS[band]
  };
}
