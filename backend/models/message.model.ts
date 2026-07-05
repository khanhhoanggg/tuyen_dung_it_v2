import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  application: Types.ObjectId;
  job: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ application: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, readAt: 1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;