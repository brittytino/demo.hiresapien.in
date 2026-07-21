import mongoose, { Document, Model } from "mongoose";

export interface ISimulationAttempt extends Document {
  candidateId: mongoose.Types.ObjectId;
  role: string;
  status: "IN_PROGRESS" | "COMPLETED" | "TERMINATED";
  startedAt: Date;
  completedAt?: Date;
  timeTaken?: number; // duration in seconds
  warningCount: number;
  warningEvents: {
    timestamp: Date;
    reason: string;
  }[];
  randomizedMissions: string[];
  reattemptCount: number;
  isTest: boolean; // true for admin/test accounts — filtered from dashboard
}

const SimulationAttemptSchema = new mongoose.Schema<ISimulationAttempt>(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "data-scientist",
      index: true,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "TERMINATED"],
      default: "IN_PROGRESS",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    timeTaken: { type: Number },
    warningCount: { type: Number, default: 0 },
    warningEvents: [
      {
        timestamp: { type: Date, default: Date.now },
        reason: { type: String, required: true },
      },
    ],
    randomizedMissions: [{ type: String }],
    reattemptCount: { type: Number, default: 0 },
    isTest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for admin dashboard queries (filter by status, sort by startedAt)
SimulationAttemptSchema.index({ status: 1, startedAt: -1 });

export const SimulationAttempt: Model<ISimulationAttempt> =
  mongoose.models.SimulationAttempt ||
  mongoose.model<ISimulationAttempt>("SimulationAttempt", SimulationAttemptSchema);

