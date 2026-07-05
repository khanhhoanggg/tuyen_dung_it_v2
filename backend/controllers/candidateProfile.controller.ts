import { Request, Response } from "express";
import CandidateProfile from "../models/candidateProfile.model";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user!.sub });

    if (!profile) {
      return res.status(200).json({
        code: "success",
        message: "Chua co ho so, vui long cap nhat",
        data: null,
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Lay ho so thanh cong",
      data: profile,
    });
  } catch (err) {
    console.error("Get candidate profile error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const upsertMyProfile = async (req: Request, res: Response) => {
  try {
    const { avatarUrl, phone, headline, bio, skills, experiences, educations } =
      req.body;

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user!.sub },
      {
        user: req.user!.sub,
        avatarUrl,
        phone,
        headline,
        bio,
        skills,
        experiences,
        educations,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      code: "success",
      message: "Cap nhat ho so thanh cong",
      data: profile,
    });
  } catch (err) {
    console.error("Update candidate profile error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const uploadMyCv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: "bad_request",
        message: "Vui long chon file CV de upload",
      });
    }

    const cvUrl = `/uploads/cv/${req.file.filename}`;

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user!.sub },
      {
        user: req.user!.sub,
        cvUrl,
        cvOriginalName: req.file.originalname,
        cvUploadedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      code: "success",
      message: "Upload CV thanh cong",
      data: profile,
    });
  } catch (err) {
    console.error("Upload CV error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};