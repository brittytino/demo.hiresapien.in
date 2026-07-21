import { describe, it, expect } from "vitest";
import { SDE_WEIGHTS_V2 } from "../weights/sde";
import { DATA_SCIENTIST_WEIGHTS_V2 } from "../weights/data-scientist";
import { calculateRenormalizedScore, retrofitLegacyDataScientist } from "../aggregator";

describe("HireSapien v2.1 — Scoring Aggregator & Renormalization Suite", () => {
  
  it("should verify that SDE Weights sum to exactly 100", () => {
    const total = Object.values(SDE_WEIGHTS_V2).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it("should verify that Data Scientist Weights sum to exactly 100", () => {
    const total = Object.values(DATA_SCIENTIST_WEIGHTS_V2).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it("should calculate correct overall score with full competencies", () => {
    const scores: Record<string, number> = {
      RequirementUnderstanding:   100,
      EngineeringPlanning:        100,
      CodebaseNavigation:         100,
      InvestigationDebugging:     100,
      FeatureImplementation:      100,
      APIAndDatabaseIntegration:  100,
      TestingAndQuality:          100,
      EngineeringCommunication:   100,
      Productivity:               100,
      AICollaboration:            100,
      EngineeringBehavior:        100,
      DeliveryExcellence:         100,
    };
    const overall = calculateRenormalizedScore(scores, SDE_WEIGHTS_V2);
    expect(overall).toBe(100);
  });

  it("should calculate correct overall score with zero scores", () => {
    const scores: Record<string, number> = {
      RequirementUnderstanding:   0,
      EngineeringPlanning:        0,
      CodebaseNavigation:         0,
      InvestigationDebugging:     0,
      FeatureImplementation:      0,
      APIAndDatabaseIntegration:  0,
      TestingAndQuality:          0,
      EngineeringCommunication:   0,
      Productivity:               0,
      AICollaboration:            0,
      EngineeringBehavior:        0,
      DeliveryExcellence:         0,
    };
    const overall = calculateRenormalizedScore(scores, SDE_WEIGHTS_V2);
    expect(overall).toBe(0);
  });

  it("should mathematically renormalize missing competencies correctly", () => {
    // We only pass 2 competencies:
    // RequirementUnderstanding (weight 10) score 80
    // FeatureImplementation (weight 10) score 90
    // Total weight of subset: 20
    // Expected renormalized score: Math.round( (80*10 + 90*10) / 20 ) = 85
    const partialScores: Record<string, number> = {
      RequirementUnderstanding: 80,
      FeatureImplementation: 90,
    };
    const overall = calculateRenormalizedScore(partialScores, DATA_SCIENTIST_WEIGHTS_V2);
    expect(overall).toBe(85);
  });

  it("should correctly retrofit legacy Data Scientist scores and renormalize them", () => {
    const legacyScores = {
      ProblemFraming: 90,        // maps to RequirementUnderstanding (weight 10)
      Prioritization: 80,        // maps to EngineeringPlanning (weight 10)
      DataLiteracy: 70,          // maps to CodebaseNavigation (weight 5) & APIAndDatabaseIntegration (weight 10)
      AnalyticalReasoning: 80,   // maps to FeatureImplementation (weight 10) & half of InvestigationDebugging
      RootCauseAnalysis: 90,      // maps to half of InvestigationDebugging
      DataQualityAwareness: 60,  // maps to TestingAndQuality (weight 8)
      Communication: 85,         // maps to EngineeringCommunication (weight 12)
      BusinessThinking: 75,      // maps to EngineeringBehavior (weight 5)
    };

    const retroScores = retrofitLegacyDataScientist(legacyScores);

    // Let's check keys and expected values:
    expect(retroScores.RequirementUnderstanding).toBe(90);
    expect(retroScores.EngineeringPlanning).toBe(80);
    expect(retroScores.CodebaseNavigation).toBe(70);
    expect(retroScores.APIAndDatabaseIntegration).toBe(70);
    expect(retroScores.FeatureImplementation).toBe(80);
    expect(retroScores.InvestigationDebugging).toBe(85); // round( (80 + 90) / 2 )
    expect(retroScores.TestingAndQuality).toBe(60);
    expect(retroScores.EngineeringCommunication).toBe(85);
    expect(retroScores.EngineeringBehavior).toBe(75);

    // Verify unmapped ones are undefined:
    expect(retroScores.Productivity).toBeUndefined();
    expect(retroScores.AICollaboration).toBeUndefined();
    expect(retroScores.DeliveryExcellence).toBeUndefined();

    // Verify math renormalization:
    // Weights of mapped:
    // RequirementUnderstanding: 10
    // EngineeringPlanning: 10
    // CodebaseNavigation: 5
    // InvestigationDebugging: 15
    // FeatureImplementation: 10
    // APIAndDatabaseIntegration: 10
    // TestingAndQuality: 8
    // EngineeringCommunication: 12
    // EngineeringBehavior: 5
    // Sum of available weights: 10+10+5+15+10+10+8+12+5 = 85
    // Weighted sum: 90*10 + 80*10 + 70*5 + 85*15 + 80*10 + 70*10 + 60*8 + 85*12 + 75*5
    //             = 900  + 800  + 350  + 1275  + 800  + 700  + 480  + 1020  + 375
    //             = 7000
    // Renormalized overall: Math.round(6700 / 85) = 79
    const overall = calculateRenormalizedScore(retroScores, DATA_SCIENTIST_WEIGHTS_V2);
    expect(overall).toBe(79);
  });
});
