import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICandidatePreference extends Document {
  user: Types.ObjectId;
  desiredSkills: string[];
  desiredLocations: string[];
  desiredLevel?: "Intern" | "Fresher" | "Junior" | "Middle" | "Senior" | "Lead";
  desiredType?: "Onsite" | "Hybrid" | "Remote";
  minSalary?: number;
  maxSalary?: number;
  isOpenToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const candidatePreferenceSchema = new Schema<ICandidatePreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    desiredSkills: { type: [String], default: [] },
    desiredLocations: { type: [String], default: [] },
    desiredLevel: {
      type: String,
      enum: ["Intern", "Fresher", "Junior", "Middle", "Senior", "Lead"],
    },
    desiredType: {
      type: String,
      enum: ["Onsite", "Hybrid", "Remote"],
    },
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },
    isOpenToWork: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CandidatePreference = mongoose.model<ICandidatePreference>(
  "CandidatePreference",
  candidatePreferenceSchema
);

export default CandidatePreference;