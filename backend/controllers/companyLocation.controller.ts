import { Request, Response } from "express";
import CompanyProfile from "../models/companyProfile.model";
import CompanyLocation from "../models/companyLocation.model";

export const listMyCompanyLocations = async (req: Request, res: Response) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user!.sub });

    if (!companyProfile) {
      return res.status(200).json({
        code: "success",
        message: "Cong ty chua co ho so, chua the co dia diem",
        data: [],
      });
    }

    const locations = await CompanyLocation.find({
      companyProfile: companyProfile._id,
    }).populate("vietnamLocation");

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach dia diem thanh cong",
      data: locations,
    });
  } catch (err) {
    console.error("List company locations error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const addMyCompanyLocation = async (req: Request, res: Response) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user!.sub });

    if (!companyProfile) {
      return res.status(400).json({
        code: "bad_request",
        message: "Vui long tao ho so cong ty truoc khi them dia diem",
      });
    }

    const { vietnamLocation, addressDetail, isHeadquarters } = req.body;

    const location = await CompanyLocation.create({
      companyProfile: companyProfile._id,
      vietnamLocation,
      addressDetail,
      isHeadquarters: Boolean(isHeadquarters),
    });

    return res.status(201).json({
      code: "success",
      message: "Them dia diem thanh cong",
      data: location,
    });
  } catch (err) {
    console.error("Add company location error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const deleteMyCompanyLocation = async (req: Request, res: Response) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user!.sub });

    if (!companyProfile) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay ho so cong ty",
      });
    }

    await CompanyLocation.findOneAndDelete({
      _id: req.params.id,
      companyProfile: companyProfile._id,
    });

    return res.status(200).json({
      code: "success",
      message: "Xoa dia diem thanh cong",
    });
  } catch (err) {
    console.error("Delete company location error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};