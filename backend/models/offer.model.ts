import mongoose, { Schema, Document, Types } from "mongoose";

export type OfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "withdrawn";

export interface IOffer extends Document {
  job: Types.ObjectId;
  application: Types.ObjectId;
  candidate: Types.ObjectId;
  company: Types.ObjectId;
  position: string;
  salary: string;
  startDate?: Date;
  content: string; // noi dung offer letter (co the la HTML/markdown)
  status: OfferStatus;
  candidateSignature?: string; // ho ten day du de "ky so" don gian
  signedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: String, required: true, trim: true, maxlength: 150 },
    salary: { type: String, required: true, trim: true },
    startDate: { type: Date },
    content: { type: String, required: true, maxlength: 10000 },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined", "withdrawn"],
      default: "draft",
    },
    candidateSignature: { type: String, trim: true, maxlength: 150 },
    signedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Moi don ung tuyen chi nen co 1 offer dang hoat dong
offerSchema.index({ application: 1 }, { unique: true });
offerSchema.index({ candidate: 1, createdAt: -1 });
offerSchema.index({ company: 1, createdAt: -1 });

const Offer = mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;