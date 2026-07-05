import { Request, Response } from "express";
import Job from "../models/job.model";
import Application from "../models/application.model";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  updateApplicationAtsSchema
} from "../validates/application.validate";

export const applyToJob = async (req: Request, res: Response) => {
  try {
    const { error, value } = createApplicationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    const existing = await Application.findOne({
      job: job._id,
      candidate: req.user!.sub,
    });

    if (existing) {
      return res.status(409).json({
        code: "already_applied",
        message: "Ban da ung tuyen vi tri nay roi",
      });
    }

    const application = await Application.create({
      job: job._id,
      candidate: req.user!.sub,
      message: value.message,
    });

    return res.status(201).json({
      code: "success",
      message: "Ung tuyen thanh cong",
      data: application,
    });
  } catch (err) {
    console.error("Apply job error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ candidate: req.user!.sub })
      .select("-rating -internalNote -tags")
      .populate("job")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      code: "success",
      message: "Lay danh sach ung tuyen thanh cong",
      data: applications,
    });
  } catch (err) {
    console.error("Get my applications error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen xem ung vien cua tin nay",
      });
    }

    const applications = await Application.find({ job: job._id })
      .populate("candidate", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach ung vien thanh cong",
      data: applications,
    });
  } catch (err) {
    console.error("Get job applications error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateApplicationStatusSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay don ung tuyen",
      });
    }

    const job = application.job as any;

    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen cap nhat don ung tuyen nay",
      });
    }

    application.status = value.status;
    await application.save();

    return res.status(200).json({
      code: "success",
      message: "Cap nhat trang thai ung tuyen thanh cong",
      data: application,
    });
  } catch (err) {
    console.error("Update application status error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

export const getCompanyStats = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ postedBy: req.user!.sub }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const grouped = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {
      new: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
    };

    grouped.forEach((item) => {
      counts[item._id] = item.count;
    });

    return res.status(200).json({
      code: "success",
      message: "Lay thong ke thanh cong",
      data: {
        totalJobs: jobs.length,
        ...counts,
      },
    });
  } catch (err) {
    console.error("Get company stats error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};
// Cong ty cap nhat rating / note noi bo / tag cho 1 don ung tuyen - PATCH /api/applications/:id/ats
export const updateApplicationAts = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateApplicationAtsSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay don ung tuyen",
      });
    }

    const job = application.job as any;

    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen cap nhat don ung tuyen nay",
      });
    }

    if (value.rating !== undefined) application.rating = value.rating;
    if (value.internalNote !== undefined) application.internalNote = value.internalNote;
    if (value.tags !== undefined) application.tags = value.tags;

    await application.save();

    return res.status(200).json({
      code: "success",
      message: "Cap nhat danh gia ung vien thanh cong",
      data: application,
    });
  } catch (err) {
    console.error("Update application ATS error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};