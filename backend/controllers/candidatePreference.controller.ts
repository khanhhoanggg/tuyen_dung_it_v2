import { Request, Response } from "express";
import CandidatePreference from "../models/candidatePreference.model";

export const getMyPreference = async (req: Request, res: Response) => {
  try {
    const preference = await CandidatePreference.findOne({
      user: req.user!.sub,
    });

    if (!preference) {
      return res.status(200).json({
        code: "success",
        message: "Chua co tieu chi, vui long cap nhat",
        data: null,
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Lay tieu chi thanh cong",
      data: preference,
    });
  } catch (err) {
    console.error("Get candidate preference error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const upsertMyPreference = async (req: Request, res: Response) => {
  try {
    const {
      desiredSkills,
      desiredLocations,
      desiredLevel,
      desiredType,
      minSalary,
      maxSalary,
      isOpenToWork,
    } = req.body;

    const preference = await CandidatePreference.findOneAndUpdate(
      { user: req.user!.sub },
      {
        user: req.user!.sub,
        desiredSkills,
        desiredLocations,
        desiredLevel,
        desiredType,
        minSalary,
        maxSalary,
        isOpenToWork,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      code: "success",
      message: "Cap nhat tieu chi thanh cong",
      data: preference,
    });
  } catch (err) {
    console.error("Update candidate preference error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};