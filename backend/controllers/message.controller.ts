import { Request, Response } from "express";
import mongoose from "mongoose";
import Application from "../models/application.model";
import Job from "../models/job.model";
import Message from "../models/message.model";
import { sendMessageSchema } from "../validates/message.validate";

// Ham dung chung: xac dinh nguoi dung hien tai co thuoc ve don ung tuyen nay khong,
// tra ve { application, job, recipientId } neu hop le, nem loi neu khong
const resolveParticipant = async (
  applicationId: string,
  userId: string,
  userRole: string
) => {
  const application = await Application.findById(applicationId).populate("job");

  if (!application) {
    return {
      error: { status: 404, code: "not_found", message: "Khong tim thay don ung tuyen" },
    };
  }

  const job = application.job as any;
  const isCandidate = String(application.candidate) === userId;
  const isCompany = String(job.postedBy) === userId;

  if (!isCandidate && !isCompany && userRole !== "admin") {
    return {
      error: {
        status: 403,
        code: "forbidden",
        message: "Ban khong thuoc ve cuoc trao doi nay",
      },
    };
  }

  const recipientId = isCandidate ? String(job.postedBy) : String(application.candidate);

  return { application, job, recipientId };
};

// Gui tin nhan trong 1 don ung tuyen - POST /api/applications/:applicationId/messages
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { error, value } = sendMessageSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((detail) => detail.message),
      });
    }

    const result = await resolveParticipant(
      String(req.params.applicationId),
      req.user!.sub,
      req.user!.role
    );

    if (result.error) {
      return res.status(result.error.status).json({
        code: result.error.code,
        message: result.error.message,
      });
    }

    const { application, job, recipientId } = result;

    const message = await Message.create({
      application: application._id,
      job: job._id,
      sender: req.user!.sub,
      recipient: recipientId,
      content: value.content,
    });

    return res.status(201).json({
      code: "success",
      message: "Gui tin nhan thanh cong",
      data: message,
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Xem toan bo hoi thoai cua 1 don ung tuyen - GET /api/applications/:applicationId/messages
// Tu dong danh dau da doc cac tin nhan gui den minh
export const getConversation = async (req: Request, res: Response) => {
  try {
    const result = await resolveParticipant(
      String(req.params.applicationId),
      req.user!.sub,
      req.user!.role
    );

    if (result.error) {
      return res.status(result.error.status).json({
        code: result.error.code,
        message: result.error.message,
      });
    }

    const { application } = result;

    const messages = await Message.find({ application: application._id })
      .populate("sender", "-password")
      .populate("recipient", "-password")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        application: application._id,
        recipient: req.user!.sub,
        readAt: { $exists: false },
      },
      { readAt: new Date() }
    );

    return res.status(200).json({
      code: "success",
      message: "Lay hoi thoai thanh cong",
      data: messages,
    });
  } catch (err) {
    console.error("Get conversation error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};

// Cong ty xem danh sach hoi thoai (theo tung don ung tuyen) - GET /api/messages/company/conversations
export const listCompanyConversations = async (req: Request, res: Response) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user!.sub }).select("_id");
    const myJobIds = myJobs.map((j) => j._id);
    const myUserObjectId = new mongoose.Types.ObjectId(req.user!.sub);

    const latestMessages = await Message.aggregate([
      { $match: { job: { $in: myJobIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$application",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipient", myUserObjectId] },
                    { $eq: [{ $ifNull: ["$readAt", null] }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    return res.status(200).json({
      code: "success",
      message: "Lay danh sach hoi thoai thanh cong",
      data: latestMessages,
    });
  } catch (err) {
    console.error("List company conversations error:", err);
    return res.status(500).json({
      code: "server_error",
      message: "Co loi xay ra, vui long thu lai sau",
    });
  }
};