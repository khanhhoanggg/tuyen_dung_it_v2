import mongoose, { Schema, Document, Types } from "mongoose";

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface IJobInvitation extends Document {
  job: Types.ObjectId;
  invitedBy: Types.ObjectId; // User (role: company)
  candidate: Types.ObjectId; // User (role: candidate)
  message?: string;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const jobInvitationSchema = new Schema<IJobInvitation>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Cong ty chi moi 1 ung vien 1 lan cho 1 job
jobInvitationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const JobInvitation = mongoose.model<IJobInvitation>(
  "JobInvitation",
  jobInvitationSchema
);

export default JobInvitation;