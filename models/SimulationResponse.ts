import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISimulationResponse extends Document {
  candidateId: mongoose.Schema.Types.ObjectId;
  attemptId: mongoose.Schema.Types.ObjectId;
  taskId: string;
  missionId: string;
  interactionType: string;
  selectedOption?: any;
  textValue?: string;
  sliderValue?: number;
  scoreEarned: number;
  maxScore: number;
  competenciesHit: string[];
  createdAt: Date;
}

const SimulationResponseSchema = new Schema<ISimulationResponse>(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SimulationAttempt",
      required: true,
      index: true,
    },
    taskId: { type: String, required: true },
    missionId: { type: String, required: true },
    interactionType: { type: String, required: true },
    selectedOption: { type: mongoose.Schema.Types.Mixed },
    textValue: { type: String },
    sliderValue: { type: Number },
    scoreEarned: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    competenciesHit: [{ type: String }],
  },
  { timestamps: true }
);

// Optimize querying responses by attempt
SimulationResponseSchema.index({ attemptId: 1, createdAt: 1 });

export const SimulationResponse: Model<ISimulationResponse> =
  mongoose.models.SimulationResponse ||
  mongoose.model<ISimulationResponse>("SimulationResponse", SimulationResponseSchema);
