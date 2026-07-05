import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICandidateJobActivity extends Document {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  action: "saved" | "viewed";
  createdAt: Date;
}

const candidateJobActivitySchema = new Schema<ICandidateJobActivity>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["saved", "viewed"],
      required: true,
    },
  },
  { timestamps: true }
);

// Moi ung vien chi co 1 ban ghi cho 1 hanh dong tren 1 job
// (vd: khong the "saved" 1 job 2 lan, nhung co the vua "saved" vua "viewed" cung 1 job)
candidateJobActivitySchema.index(
  { job: 1, candidate: 1, action: 1 },
  { unique: true }
);

const CandidateJobActivity = mongoose.model<ICandidateJobActivity>(
  "CandidateJobActivity",
  candidateJobActivitySchema
);

export default CandidateJobActivity;