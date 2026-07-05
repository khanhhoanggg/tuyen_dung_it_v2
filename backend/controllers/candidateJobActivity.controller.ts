import { Request, Response } from "express";
import Job from "../models/job.model";
import CandidateJobActivity from "../models/candidateJobActivity.model";

export const saveJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    const existing = await CandidateJobActivity.findOne({
      job: job._id,
      candidate: req.user!.sub,
      action: "saved",
    });

    if (existing) {
      return res.status(200).json({
        code: "success",
        message: "Viec lam da duoc luu truoc do",
        data: existing,
      });
    }

    const saved = await CandidateJobActivity.create({
      job: job._id,
      candidate: req.user!.sub,
      action: "saved",
    });

    return res.status(201).json({
      code: "success",
      message: "Da luu viec lam",
      data: saved,
    });
  } catch (err) {
    console.error("Save job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const unsaveJob = async (req: Request, res: Response) => {
  try {
    await CandidateJobActivity.findOneAndDelete({
      job: req.params.jobId,
      candidate: req.user!.sub,
      action: "saved",
    });

    return res.status(200).json({
      code: "success",
      message: "Da bo luu viec lam",
    });
  } catch (err) {
    console.error("Unsave job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const listSavedJobs = async (req: Request, res: Response) => {
  try {
    const savedJobs = await CandidateJobActivity.find({
      candidate: req.user!.sub,
      action: "saved",
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach viec da luu thanh cong",
      data: savedJobs,
    });
  } catch (err) {
    console.error("List saved jobs error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Ham moi: ghi nhan "da xem" 1 job
export const trackViewJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    // Dung upsert de tranh loi trung unique index neu ung vien xem lai job da xem truoc do
    await CandidateJobActivity.findOneAndUpdate(
      { job: job._id, candidate: req.user!.sub, action: "viewed" },
      { job: job._id, candidate: req.user!.sub, action: "viewed" },
      { upsert: true }
    );

    return res.status(200).json({
      code: "success",
      message: "Da ghi nhan luot xem",
    });
  } catch (err) {
    console.error("Track view job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Ham moi: lay danh sach job da xem
export const listViewedJobs = async (req: Request, res: Response) => {
  try {
    const viewedJobs = await CandidateJobActivity.find({
      candidate: req.user!.sub,
      action: "viewed",
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach viec da xem thanh cong",
      data: viewedJobs,
    });
  } catch (err) {
    console.error("List viewed jobs error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};