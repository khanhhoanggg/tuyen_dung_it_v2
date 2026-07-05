import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompanyLocation extends Document {
  companyProfile: Types.ObjectId;
  vietnamLocation: Types.ObjectId;
  addressDetail?: string;
  isHeadquarters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companyLocationSchema = new Schema<ICompanyLocation>(
  {
    companyProfile: {
      type: Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
    vietnamLocation: {
      type: Schema.Types.ObjectId,
      ref: "VietnamLocation",
      required: true,
    },
    addressDetail: { type: String, trim: true, maxlength: 300 },
    isHeadquarters: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CompanyLocation = mongoose.model<ICompanyLocation>(
  "CompanyLocation",
  companyLocationSchema
);

export default CompanyLocation;