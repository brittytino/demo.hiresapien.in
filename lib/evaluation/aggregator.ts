/**
 * HireSapien v2.1 — Scoring Aggregator & Renormalization Engine
 * Contains mathematically rigorous weight renormalization and legacy retrofitting.
 */

import { DATA_SCIENTIST_WEIGHTS_V2 } from "./weights/data-scientist";
import type { CompetencyKey } from "./competency-framework";

/**
 * Calculates the overall execution score by renormalizing weights over ONLY available competencies.
 * Prevents artificially depressing scores for candidates with missing/undefined signals.
 *
 * Formula:
 * Overall Score = round( (sum of Score_i * Weight_i) / (sum of Weight_j) )
 *
 * @param scores Map of competency keys to scores (0-100)
 * @param weights Map of competency weights (sums to 100 for a full profile)
 */
export function calculateRenormalizedScore(
  scores: Record<string, number | undefined | null>,
  weights: Record<string, number>
): number {
  let weightedSum = 0;
  let weightSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const score = scores[key];
    if (score !== undefined && score !== null && typeof score === "number") {
      weightedSum += score * weight;
      weightSum += weight;
    }
  }

  if (weightSum <= 0) return 0;
  return Math.min(100, Math.round(weightedSum / weightSum));
}

/**
 * Maps the legacy 8 Data Scientist competencies to the new 12 competency framework.
 * Omit competencies that were not measured in the legacy flow, triggering renormalization.
 */
export function retrofitLegacyDataScientist(legacyScores: Record<string, number | undefined | null>): Record<string, number> {
  const pFrame = legacyScores.ProblemFraming ?? 70;
  const dLit = legacyScores.DataLiteracy ?? 70;
  const aReason = legacyScores.AnalyticalReasoning ?? 70;
  const rcAnal = legacyScores.RootCauseAnalysis ?? 70;
  const prio = legacyScores.Prioritization ?? 70;
  const bizThink = legacyScores.BusinessThinking ?? 70;
  const dQual = legacyScores.DataQualityAwareness ?? 70;
  const comm = legacyScores.Communication ?? 70;

  // We explicitly map only the available signals
  return {
    RequirementUnderstanding: pFrame,
    EngineeringPlanning: prio,
    CodebaseNavigation: dLit,
    InvestigationDebugging: Math.round(aReason * 0.5 + rcAnal * 0.5),
    FeatureImplementation: aReason,
    APIAndDatabaseIntegration: dLit,
    TestingAndQuality: dQual,
    EngineeringCommunication: comm,
    EngineeringBehavior: bizThink,
    // The other 3 (Productivity, AICollaboration, DeliveryExcellence)
    // are omitted (undefined) to be renormalized mathematically over the 9 above.
  };
}
