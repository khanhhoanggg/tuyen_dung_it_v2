import { Request, Response } from "express";
import CompanyProfile from "../models/companyProfile.model";

export const getMyCompanyProfile = async (req: Request, res: Response) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user!.sub });

    if (!profile) {
      return res.status(200).json({
        code: "success",
        message: "Chua co ho so cong ty, vui long cap nhat",
        data: null,
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Lay ho so cong ty thanh cong",
      data: profile,
    });
  } catch (err) {
    console.error("Get company profile error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const upsertMyCompanyProfile = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      logoUrl,
      website,
      industry,
      companySize,
      description,
      foundedYear,
    } = req.body;

    const profile = await CompanyProfile.findOneAndUpdate(
      { user: req.user!.sub },
      {
        user: req.user!.sub,
        companyName,
        logoUrl,
        website,
        industry,
        companySize,
        description,
        foundedYear,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      code: "success",
      message: "Cap nhat ho so cong ty thanh cong",
      data: profile,
    });
  } catch (err) {
    console.error("Update company profile error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};