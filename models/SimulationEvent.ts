import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISimulationEvent extends Document {
  attemptId: string;
  type: string;
  timestamp: Date;
  stage: string;
  value?: number;
  payload?: Record<string, unknown>;
  competencySignals: string[];
}

const SimulationEventSchema = new Schema<ISimulationEvent>({
  attemptId:         { type: String, required: true, index: true },
  type:              { type: String, required: true },
  timestamp:         { type: Date,   required: true, default: Date.now },
  stage:             { type: String, required: true },
  value:             { type: Number },
  payload:           { type: Schema.Types.Mixed },
  competencySignals: { type: [String], default: [] },
});

SimulationEventSchema.index({ attemptId: 1, timestamp: 1 });
SimulationEventSchema.index({ attemptId: 1, type: 1 });

const SimulationEvent: Model<ISimulationEvent> =
  mongoose.models.SimulationEvent ||
  mongoose.model<ISimulationEvent>("SimulationEvent", SimulationEventSchema);

export default SimulationEvent;
