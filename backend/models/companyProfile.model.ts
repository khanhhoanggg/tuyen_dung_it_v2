import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompanyProfile extends Document {
  user: Types.ObjectId; // ref toi User co role = "company"
  companyName: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  description?: string;
  foundedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true, maxlength: 150 },
    logoUrl: { type: String },
    website: { type: String, trim: true },
    industry: { type: String, trim: true, maxlength: 100 },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    description: { type: String, maxlength: 3000 },
    foundedYear: { type: Number, min: 1900, max: new Date().getFullYear() },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema
);

export default CompanyProfile; 