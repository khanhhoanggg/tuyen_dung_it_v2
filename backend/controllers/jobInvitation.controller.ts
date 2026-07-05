import { Request, Response } from "express";
import Job from "../models/job.model";
import User from "../models/user.model";
import JobInvitation from "../models/jobInvitation.model";

// Cong ty moi ung vien qua email - POST /api/jobs/:jobId/invitations
export const inviteCandidate = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    if (String(job.postedBy) !== req.user!.sub) {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen moi ung vien cho tin nay",
      });
    }

    const { candidateEmail, message } = req.body;

    const candidate = await User.findOne({
      email: candidateEmail,
      role: "candidate",
    });

    if (!candidate) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay ung vien voi email nay",
      });
    }

    const existing = await JobInvitation.findOne({
      job: job._id,
      candidate: candidate._id,
    });

    if (existing) {
      return res.status(200).json({
        code: "success",
        message: "Da moi ung vien nay truoc do",
        data: existing,
      });
    }

    const invitation = await JobInvitation.create({
      job: job._id,
      invitedBy: req.user!.sub,
      candidate: candidate._id,
      message,
    });

    return res.status(201).json({
      code: "success",
      message: "Moi ung vien thanh cong",
      data: invitation,
    });
  } catch (err) {
    console.error("Invite candidate error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Cong ty xem danh sach da moi cho 1 job - GET /api/jobs/:jobId/invitations
export const listJobInvitations = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay tin tuyen dung",
      });
    }

    if (String(job.postedBy) !== req.user!.sub) {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen xem danh sach nay",
      });
    }

    const invitations = await JobInvitation.find({ job: job._id })
      .populate("candidate", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach loi moi thanh cong",
      data: invitations,
    });
  } catch (err) {
    console.error("List job invitations error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Ung vien xem loi moi cua minh - GET /api/invitations/mine
export const listMyInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await JobInvitation.find({ candidate: req.user!.sub })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach loi moi thanh cong",
      data: invitations,
    });
  } catch (err) {
    console.error("List my invitations error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Ung vien phan hoi loi moi - PUT /api/invitations/:id/respond
export const respondToInvitation = async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // "accepted" | "declined"

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        code: "bad_request",
        message: "Trang thai khong hop le",
      });
    }

    const invitation = await JobInvitation.findOneAndUpdate(
      { _id: req.params.id, candidate: req.user!.sub },
      { status },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({
        code: "not_found",
        message: "Khong tim thay loi moi",
      });
    }

    return res.status(200).json({
      code: "success",
      message: "Phan hoi loi moi thanh cong",
      data: invitation,
    });
  } catch (err) {
    console.error("Respond to invitation error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};