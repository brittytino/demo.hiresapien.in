import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompetencyScore {
  key: string;
  label: string;
  score: number;           // 0-100
  weight: number;          // weight percentage
  weightedScore: number;   // score * weight / 100
  evidenceCount: number;   // number of events that contributed
  evidenceTrail: string[]; // human-readable evidence trail items
  aiEvaluated: boolean;    // whether AI eval was used
  primaryModel?: string;   // "gemini" or "claude"
  shadowScore?: number;    // divergent model score (if flagged)
}

export interface IBehaviorProfile {
  traits: { label: string; evidence: string[] }[];
  strengths: string[];
  improvementAreas: string[];
  learningRecommendations: string[];
}

export interface IEvaluationReport extends Document {
  attemptId: string;
  candidateId: string;
  role: string;
  executionScore: number;          // 0-100 weighted sum
  hiringRecommendation: string;    // band key: STRONG_HIRE | HIRE | etc.
  competencyScores: ICompetencyScore[];
  behaviorProfile: IBehaviorProfile;
  totalEventsLogged: number;
  activeTimeMs: number;
  aiDivergenceDetected: boolean;   // primary vs shadow score diff > 15
  flaggedForHumanReview: boolean;
  flagReasons: string[];
  primaryModel: string;            // "gemini"
  shadowModel: string;             // "claude"
  generatedAt: Date;
  pdfUrl?: string;                 // generated PDF download URL
  shareToken?: string;             // public shareable link token
}

const CompetencyScoreSchema = new Schema<ICompetencyScore>({
  key:           { type: String, required: true },
  label:         { type: String, required: true },
  score:         { type: Number, required: true },
  weight:        { type: Number, required: true },
  weightedScore: { type: Number, required: true },
  evidenceCount: { type: Number, default: 0 },
  evidenceTrail: { type: [String], default: [] },
  aiEvaluated:   { type: Boolean, default: false },
  primaryModel:  { type: String },
  shadowScore:   { type: Number },
}, { _id: false });

const EvaluationReportSchema = new Schema<IEvaluationReport>({
  attemptId:              { type: String, required: true, unique: true },
  candidateId:            { type: String, required: true },
  role:                   { type: String, required: true },
  executionScore:         { type: Number, required: true },
  hiringRecommendation:   { type: String, required: true },
  competencyScores:       { type: [CompetencyScoreSchema], default: [] },
  behaviorProfile:        { type: Schema.Types.Mixed, required: true },
  totalEventsLogged:      { type: Number, default: 0 },
  activeTimeMs:           { type: Number, default: 0 },
  aiDivergenceDetected:   { type: Boolean, default: false },
  flaggedForHumanReview:  { type: Boolean, default: false },
  flagReasons:            { type: [String], default: [] },
  primaryModel:           { type: String, default: "gemini" },
  shadowModel:            { type: String, default: "claude" },
  generatedAt:            { type: Date, default: Date.now },
  pdfUrl:                 { type: String },
  shareToken:             { type: String, unique: true, sparse: true },
});

EvaluationReportSchema.index({ attemptId: 1 });
EvaluationReportSchema.index({ candidateId: 1, generatedAt: -1 });
EvaluationReportSchema.index({ role: 1, executionScore: -1 });
EvaluationReportSchema.index({ flaggedForHumanReview: 1 });
EvaluationReportSchema.index({ shareToken: 1 });

const EvaluationReport: Model<IEvaluationReport> =
  mongoose.models.EvaluationReport ||
  mongoose.model<IEvaluationReport>("EvaluationReport", EvaluationReportSchema);

export default EvaluationReport;
