import { Request, Response } from "express";
import Application from "../models/application.model";
import InterviewSchedule from "../models/interviewSchedule.model";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "../validates/interviewSchedule.validate";

// Cong ty tao lich phong van cho 1 don ung tuyen - POST /api/applications/:applicationId/interviews
export const createInterview = async (req: Request, res: Response) => {
  try {
    const { error, value } = createInterviewSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const application = await Application.findById(req.params.applicationId).populate("job");

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
        message: "Ban khong co quyen tao lich phong van cho don nay",
      });
    }

    const interview = await InterviewSchedule.create({
      job: job._id,
      application: application._id,
      candidate: application.candidate,
      company: job.postedBy,
      scheduledAt: value.scheduledAt,
      durationMinutes: value.durationMinutes,
      type: value.type,
      meetingLink: value.meetingLink,
      address: value.address,
      note: value.note,
      createdBy: req.user!.sub,
    });

    // Tu dong chuyen don ung tuyen sang trang thai "interviewing"
    if (application.status === "new") {
      application.status = "interviewing";
      await application.save();
    }

    return res.status(201).json({
      code: "success",
      message: "Tao lich phong van thanh cong",
      data: interview,
    });
  } catch (err) {
    console.error("Create interview error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Cong ty xem tat ca lich phong van cua minh - GET /api/interviews/company/mine
export const listCompanyInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await InterviewSchedule.find({ company: req.user!.sub })
      .populate("job")
      .populate("candidate", "-password")
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach lich phong van thanh cong",
      data: interviews,
    });
  } catch (err) {
    console.error("List company interviews error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Ung vien xem lich phong van cua minh - GET /api/interviews/mine
export const listMyInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await InterviewSchedule.find({ candidate: req.user!.sub })
      .populate("job")
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach lich phong van thanh cong",
      data: interviews,
    });
  } catch (err) {
    console.error("List my interviews error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Cong ty cap nhat / doi lich / huy lich - PUT /api/interviews/:id
export const updateInterview = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateInterviewSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const interview = await InterviewSchedule.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay lich phong van",
      });
    }

    if (String(interview.company) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen sua lich phong van nay",
      });
    }

    Object.assign(interview, value);
    await interview.save();

    return res.status(200).json({
      code: "success",
      message: "Cap nhat lich phong van thanh cong",
      data: interview,
    });
  } catch (err) {
    console.error("Update interview error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};