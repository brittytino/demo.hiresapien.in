/**
 * HireSapien v2.1 — Data Scientist Role Competency Weights
 * Total: 100 (verified). Adapted for the 12-competency framework.
 */

import type { CompetencyKey } from "@/lib/evaluation/competency-framework";

export const DATA_SCIENTIST_WEIGHTS_V2: Record<CompetencyKey, number> = {
  RequirementUnderstanding:   10,
  EngineeringPlanning:        10,
  CodebaseNavigation:         5,
  InvestigationDebugging:     15,
  FeatureImplementation:      10,
  APIAndDatabaseIntegration:  10,
  TestingAndQuality:          8,
  EngineeringCommunication:   12,
  Productivity:               5,
  AICollaboration:            5,
  EngineeringBehavior:        5,
  DeliveryExcellence:         5,
};

// Runtime verification in dev
if (process.env.NODE_ENV === "development") {
  const total = Object.values(DATA_SCIENTIST_WEIGHTS_V2).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    console.error(`[HireSapien] Data Scientist weights sum to ${total}, expected 100`);
  }
}
