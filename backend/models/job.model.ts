import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  salary: string;
  level: "Intern" | "Fresher" | "Junior" | "Middle" | "Senior" | "Lead";
  type: "Onsite" | "Hybrid" | "Remote";
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  status: "open" | "closed";
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, required: true, trim: true },
    salary: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["Intern", "Fresher", "Junior", "Middle", "Senior", "Lead"],
      default: "Middle",
    },
    type: {
      type: String,
      enum: ["Onsite", "Hybrid", "Remote"],
      default: "Onsite",
    },
    summary: { type: String, required: true, trim: true, maxlength: 2000 },
    skills: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", company: "text", skills: "text" });

const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;