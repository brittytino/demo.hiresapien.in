import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIInteraction extends Document {
  attemptId: string;
  stage: string;
  promptText: string;
  promptLength: number;
  responseText: string;
  qualityScore?: number;    // 0-100, scored by AI evaluation engine
  refinementCount: number;  // how many follow-up prompts to the same topic
  verified: boolean;        // did the candidate verify the output before using it?
  isSpam: boolean;          // triggered by prompt spam detector
  createdAt: Date;
}

const AIInteractionSchema = new Schema<IAIInteraction>({
  attemptId:       { type: String, required: true, index: true },
  stage:           { type: String, required: true },
  promptText:      { type: String, required: true },
  promptLength:    { type: Number, required: true },
  responseText:    { type: String, required: true },
  qualityScore:    { type: Number },
  refinementCount: { type: Number, default: 0 },
  verified:        { type: Boolean, default: false },
  isSpam:          { type: Boolean, default: false },
  createdAt:       { type: Date, default: Date.now },
});

AIInteractionSchema.index({ attemptId: 1, createdAt: 1 });

const AIInteraction: Model<IAIInteraction> =
  mongoose.models.AIInteraction ||
  mongoose.model<IAIInteraction>("AIInteraction", AIInteractionSchema);

export default AIInteraction;
