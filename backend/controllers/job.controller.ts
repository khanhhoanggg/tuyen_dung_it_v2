import { Request, Response } from "express";
import Job from "../models/job.model";
import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
} from "../validates/job.validate";

export const listJobs = async (req: Request, res: Response) => {
  try {
    const { error, value } = jobQuerySchema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const { q, location, skill, level, type, page, limit } = value;
    const filter: Record<string, unknown> = { status: "open" };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: "i" };
    if (skill) filter.skills = { $regex: skill, $options: "i" };
    if (level) filter.level = level;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach viec lam thanh cong",
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List jobs error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Lay thong tin viec lam thanh cong",
      data: job,
    });
  } catch (err) {
    return res.status(404).json({
      code: "not_found",
      message: "Khong tim thay tin tuyen dung",
    });
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ postedBy: req.user!.sub }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach tin da dang thanh cong",
      data: jobs,
    });
  } catch (err) {
    console.error("Get my jobs error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = createJobSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const job = await Job.create({ ...value, postedBy: req.user!.sub });

    return res.status(201).json({
      code: "success",
      message: "Dang tin tuyen dung thanh cong",
      data: job,
    });
  } catch (err) {
    console.error("Create job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateJobSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen sua tin nay",
      });
    }

    Object.assign(job, value);
    await job.save();

    return res.status(200).json({
      code: "success",
      message: "Cap nhat tin tuyen dung thanh cong",
      data: job,
    });
  } catch (err) {
    console.error("Update job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen xoa tin nay",
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      code: "success",
      message: "Xoa tin tuyen dung thanh cong",
    });
  } catch (err) {
    console.error("Delete job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};
