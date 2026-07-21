import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkspaceSession extends Document {
  attemptId: string;
  role: string;
  candidateId: string;
  currentStage: string;
  stagesCompleted: string[];
  toolUsage: Record<string, number>;  // toolName → seconds spent
  activeTimeMs: number;               // total active (non-idle) ms
  idleTimeMs: number;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  flaggedForReview: boolean;
  flagReason?: string;
}

const WorkspaceSessionSchema = new Schema<IWorkspaceSession>({
  attemptId:        { type: String, required: true, unique: true },
  role:             { type: String, required: true },
  candidateId:      { type: String, required: true },
  currentStage:     { type: String, default: "welcome" },
  stagesCompleted:  { type: [String], default: [] },
  toolUsage:        { type: Schema.Types.Mixed, default: {} },
  activeTimeMs:     { type: Number, default: 0 },
  idleTimeMs:       { type: Number, default: 0 },
  startedAt:        { type: Date, default: Date.now },
  lastActivityAt:   { type: Date, default: Date.now },
  completedAt:      { type: Date },
  flaggedForReview: { type: Boolean, default: false },
  flagReason:       { type: String },
});

WorkspaceSessionSchema.index({ attemptId: 1 });
WorkspaceSessionSchema.index({ role: 1, startedAt: -1 });
WorkspaceSessionSchema.index({ flaggedForReview: 1 });

const WorkspaceSession: Model<IWorkspaceSession> =
  mongoose.models.WorkspaceSession ||
  mongoose.model<IWorkspaceSession>("WorkspaceSession", WorkspaceSessionSchema);

export default WorkspaceSession;
