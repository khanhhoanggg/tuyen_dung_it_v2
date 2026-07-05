import mongoose, { Schema, Document } from "mongoose";

export interface IVietnamLocation extends Document {
  name: string; // vd: "Hồ Chí Minh", "Hà Nội"
  region: "Bac" | "Trung" | "Nam";
}

const vietnamLocationSchema = new Schema<IVietnamLocation>({
  name: { type: String, required: true, unique: true, trim: true },
  region: { type: String, enum: ["Bac", "Trung", "Nam"], required: true },
});

const VietnamLocation = mongoose.model<IVietnamLocation>(
  "VietnamLocation",
  vietnamLocationSchema
);

export default VietnamLocation;