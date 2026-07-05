import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export interface IEducation {
  school: string;
  major: string;
  startDate: Date;
  endDate?: Date;
}

export interface ICandidateProfile extends Document {
  user: Types.ObjectId;
  avatarUrl?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experiences: IExperience[];
  educations: IEducation[];
  cvUrl?: string;
  cvOriginalName?: string;
  cvUploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducation>(
  {
    school: { type: String, required: true },
    major: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { _id: false }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatarUrl: { type: String },
    phone: { type: String, trim: true },
    headline: { type: String, trim: true, maxlength: 150 },
    bio: { type: String, maxlength: 2000 },
    skills: { type: [String], default: [] },
    experiences: { type: [experienceSchema], default: [] },
    educations: { type: [educationSchema], default: [] },
    cvUrl: { type: String },
    cvOriginalName: { type: String },
    cvUploadedAt: { type: Date },
  },
  { timestamps: true }
);

const CandidateProfile = mongoose.model<ICandidateProfile>(
  "CandidateProfile",
  candidateProfileSchema
);

export default CandidateProfile;