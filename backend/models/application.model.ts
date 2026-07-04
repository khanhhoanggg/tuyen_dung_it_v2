import mongoose, { Schema, Document, Types } from "mongoose";

export type ApplicationStatus = "new" | "interviewing" | "offered" | "rejected";

export interface IApplication extends Document {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  status: ApplicationStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["new", "interviewing", "offered", "rejected"],
      default: "new",
    },
    message: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// Một ứng viên chỉ ứng tuyển 1 lần cho mỗi job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model<IApplication>("Application", applicationSchema);

export default Application;