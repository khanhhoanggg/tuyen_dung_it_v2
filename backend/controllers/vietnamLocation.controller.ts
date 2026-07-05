import { Request, Response } from "express";
import VietnamLocation from "../models/vietnamLocation.model";

export const listVietnamLocations = async (req: Request, res: Response) => {
  try {
    const locations = await VietnamLocation.find().sort({ name: 1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach dia danh thanh cong",
      data: locations,
    });
  } catch (err) {
    console.error("List vietnam locations error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};