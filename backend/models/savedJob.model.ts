import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  createdAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

savedJobSchema.index({ job: 1, candidate: 1 }, { unique: true });

const SavedJob = mongoose.model<ISavedJob>("SavedJob", savedJobSchema);

export default SavedJob;