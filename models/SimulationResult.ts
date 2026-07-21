import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISimulationResult extends Document {
  candidateId: mongoose.Types.ObjectId;
  attemptId: mongoose.Types.ObjectId;
  overallScore: number;
  competencyScores: {
    // Legacy 8 Data Scientist competencies
    ProblemFraming?: number;
    DataLiteracy?: number;
    AnalyticalReasoning?: number;
    RootCauseAnalysis?: number;
    Prioritization?: number;
    BusinessThinking?: number;
    DataQualityAwareness?: number;
    Communication?: number;
    // New 12 Engineering competencies
    RequirementUnderstanding?: number;
    EngineeringPlanning?: number;
    CodebaseNavigation?: number;
    InvestigationDebugging?: number;
    FeatureImplementation?: number;
    APIAndDatabaseIntegration?: number;
    TestingAndQuality?: number;
    EngineeringCommunication?: number;
    Productivity?: number;
    AICollaboration?: number;
    EngineeringBehavior?: number;
    DeliveryExcellence?: number;
  };
  readinessLevel: string;
  archetype?: string;
  strengths?: string[];
  improvements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SimulationResultSchema = new Schema<ISimulationResult>(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SimulationAttempt",
      required: true,
      unique: true,
    },
    overallScore: { type: Number, default: 0 },
    competencyScores: {
      ProblemFraming: { type: Number, default: 0 },
      DataLiteracy: { type: Number, default: 0 },
      AnalyticalReasoning: { type: Number, default: 0 },
      RootCauseAnalysis: { type: Number, default: 0 },
      Prioritization: { type: Number, default: 0 },
      BusinessThinking: { type: Number, default: 0 },
      DataQualityAwareness: { type: Number, default: 0 },
      Communication: { type: Number, default: 0 },
      RequirementUnderstanding: { type: Number, default: 0 },
      EngineeringPlanning: { type: Number, default: 0 },
      CodebaseNavigation: { type: Number, default: 0 },
      InvestigationDebugging: { type: Number, default: 0 },
      FeatureImplementation: { type: Number, default: 0 },
      APIAndDatabaseIntegration: { type: Number, default: 0 },
      TestingAndQuality: { type: Number, default: 0 },
      EngineeringCommunication: { type: Number, default: 0 },
      Productivity: { type: Number, default: 0 },
      AICollaboration: { type: Number, default: 0 },
      EngineeringBehavior: { type: Number, default: 0 },
      DeliveryExcellence: { type: Number, default: 0 },
    },
    readinessLevel: { type: String, default: "Explorer" },
    archetype: { type: String },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  { timestamps: true }
);

export const SimulationResult: Model<ISimulationResult> =
  mongoose.models.SimulationResult ||
  mongoose.model<ISimulationResult>("SimulationResult", SimulationResultSchema);
