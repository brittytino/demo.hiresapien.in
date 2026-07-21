/**
 * HireSapien v2.1 — SDE Role Competency Weights
 * Total: 100 (verified). Role-specific weighting per master spec.
 */

import type { CompetencyKey } from "@/lib/evaluation/competency-framework";

// Weights that sum to exactly 100
// Note: AICollaboration set to 0 — AI Assistant feature removed from SDE workspace.
// Its 6pts redistributed: FeatureImplementation +3, EngineeringCommunication +3.
export const SDE_WEIGHTS_V2: Record<CompetencyKey, number> = {
  RequirementUnderstanding:   7,   // 7
  EngineeringPlanning:        9,   // 16
  CodebaseNavigation:         6,   // 22
  InvestigationDebugging:     11,  // 33
  FeatureImplementation:      21,  // 54
  APIAndDatabaseIntegration:  7,   // 61
  TestingAndQuality:          7,   // 68
  EngineeringCommunication:   17,  // 85
  Productivity:               4,   // 89
  AICollaboration:            0,   // 89 (disabled — feature removed)
  EngineeringBehavior:        4,   // 93
  DeliveryExcellence:         7,   // 100
};

// Runtime verification in dev
if (process.env.NODE_ENV === "development") {
  const total = Object.values(SDE_WEIGHTS_V2).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    console.error(`[HireSapien] SDE weights sum to ${total}, expected 100`);
  }
}
