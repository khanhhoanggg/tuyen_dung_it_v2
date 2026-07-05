import mongoose, { Schema, Document, Types } from "mongoose";

export type InterviewType = "online" | "onsite";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface IInterviewSchedule extends Document {
  job: Types.ObjectId;
  application: Types.ObjectId;
  candidate: Types.ObjectId;
  company: Types.ObjectId; // = job.postedBy, luu them de query nhanh
  scheduledAt: Date;
  durationMinutes: number;
  type: InterviewType;
  meetingLink?: string;
  address?: string;
  note?: string;
  status: InterviewStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interviewScheduleSchema = new Schema<IInterviewSchedule>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30, min: 5, max: 480 },
    type: { type: String, enum: ["online", "onsite"], default: "online" },
    meetingLink: { type: String, trim: true, maxlength: 500 },
    address: { type: String, trim: true, maxlength: 500 },
    note: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

interviewScheduleSchema.index({ candidate: 1, scheduledAt: -1 });
interviewScheduleSchema.index({ company: 1, scheduledAt: -1 });

const InterviewSchedule = mongoose.model<IInterviewSchedule>(
  "InterviewSchedule",
  interviewScheduleSchema
);

export default InterviewSchedule;