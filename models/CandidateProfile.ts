import mongoose, { Document, Model } from "mongoose";

export interface ICandidateProfile extends Document {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  degree?: string;
  academic_status?: string;
  math_background?: string;
  career_interest?: string | string[];
  skills?: string[];
  ws_q1?: string;
  ws_q2?: string;
  ws_q3?: string;
  ds_familiarity?: number;
  data_comfort?: number;
  expectations?: string[];
  beta_signup?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateProfileSchema = new mongoose.Schema<ICandidateProfile>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    degree: { type: String },
    academic_status: { type: String },
    math_background: { type: String },
    career_interest: { type: mongoose.Schema.Types.Mixed },
    skills: [{ type: String }],
    ws_q1: { type: String },
    ws_q2: { type: String },
    ws_q3: { type: String },
    ds_familiarity: { type: Number },
    data_comfort: { type: Number },
    expectations: [{ type: String }],
    beta_signup: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CandidateProfile: Model<ICandidateProfile> =
  mongoose.models.CandidateProfile ||
  mongoose.model<ICandidateProfile>("CandidateProfile", CandidateProfileSchema);
