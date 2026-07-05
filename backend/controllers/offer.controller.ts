import { Request, Response } from "express";
import Application from "../models/application.model";
import Offer from "../models/offer.model";
import {
  createOfferSchema,
  updateOfferSchema,
  signOfferSchema,
} from "../validates/offer.validate";

// Cong ty tao offer cho 1 don ung tuyen - POST /api/applications/:applicationId/offers
export const createOffer = async (req: Request, res: Response) => {
  try {
    const { error, value } = createOfferSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        code: "validation_error",
        message: error.details.map((d) => d.message),
      });
    }

    const application = await Application.findById(req.params.applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay don ung tuyen" });
    }

    const job = application.job as any;
    if (String(job.postedBy) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen tao offer cho don nay" });
    }

    const existing = await Offer.findOne({ application: application._id });
    if (existing) {
      return res.status(409).json({
        code: "offer_already_exists",
        message: "Don ung tuyen nay da co offer, vui long sua offer hien co",
      });
    }

    const offer = await Offer.create({
      job: job._id,
      application: application._id,
      candidate: application.candidate,
      company: job.postedBy,
      position: value.position,
      salary: value.salary,
      startDate: value.startDate,
      content: value.content,
      status: value.status,
      createdBy: req.user!.sub,
    });

    if (value.status === "sent") {
      application.status = "offered";
      await application.save();
    }

    return res.status(201).json({ code: "success", message: "Tao offer thanh cong", data: offer });
  } catch (err) {
    console.error("Create offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Cong ty xem tat ca offer da tao - GET /api/offers/company/mine
export const listCompanyOffers = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find({ company: req.user!.sub })
      .populate("job")
      .populate("candidate", "-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({ code: "success", message: "Lay danh sach offer thanh cong", data: offers });
  } catch (err) {
    console.error("List company offers error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Ung vien xem offer cua minh - GET /api/offers/mine
export const listMyOffers = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find({ candidate: req.user!.sub })
      .populate("job")
      .sort({ createdAt: -1 });
    return res.status(200).json({ code: "success", message: "Lay danh sach offer thanh cong", data: offers });
  } catch (err) {
    console.error("List my offers error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Xem chi tiet 1 offer - GET /api/offers/:id
export const getOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("job").populate("candidate", "-password");
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }

    const isOwnerCompany = String(offer.company) === req.user!.sub;
    const isOwnerCandidate = String(offer.candidate._id ?? offer.candidate) === req.user!.sub;

    if (!isOwnerCompany && !isOwnerCandidate && req.user!.role !== "admin") {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen xem offer nay" });
    }

    return res.status(200).json({ code: "success", message: "Lay thong tin offer thanh cong", data: offer });
  } catch (err) {
    console.error("Get offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Cong ty sua noi dung offer - PUT /api/offers/:id (chi khi con draft hoac sent)
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateOfferSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ code: "validation_error", message: error.details.map((d) => d.message) });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }
    if (String(offer.company) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen sua offer nay" });
    }
    if (!["draft", "sent"].includes(offer.status)) {
      return res.status(400).json({ code: "invalid_status", message: "Offer da duoc phan hoi, khong the chinh sua" });
    }

    Object.assign(offer, value);
    await offer.save();

    return res.status(200).json({ code: "success", message: "Cap nhat offer thanh cong", data: offer });
  } catch (err) {
    console.error("Update offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Cong ty gui offer (draft -> sent) - PATCH /api/offers/:id/send
export const sendOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }
    if (String(offer.company) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen gui offer nay" });
    }
    if (offer.status !== "draft") {
      return res.status(400).json({ code: "invalid_status", message: "Chi co the gui offer dang o trang thai nhap (draft)" });
    }

    offer.status = "sent";
    await offer.save();
    await Application.findByIdAndUpdate(offer.application, { status: "offered" });

    return res.status(200).json({ code: "success", message: "Gui offer thanh cong", data: offer });
  } catch (err) {
    console.error("Send offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Cong ty rut lai offer - PATCH /api/offers/:id/withdraw
export const withdrawOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }
    if (String(offer.company) !== req.user!.sub && req.user!.role !== "admin") {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen rut offer nay" });
    }
    if (!["draft", "sent"].includes(offer.status)) {
      return res.status(400).json({ code: "invalid_status", message: "Offer da duoc phan hoi, khong the rut lai" });
    }

    offer.status = "withdrawn";
    await offer.save();

    return res.status(200).json({ code: "success", message: "Da rut lai offer", data: offer });
  } catch (err) {
    console.error("Withdraw offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Ung vien ky nhan offer - PATCH /api/offers/:id/sign
export const signOffer = async (req: Request, res: Response) => {
  try {
    const { error, value } = signOfferSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ code: "validation_error", message: error.details.map((d) => d.message) });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }
    if (String(offer.candidate) !== req.user!.sub) {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen ky offer nay" });
    }
    if (offer.status !== "sent") {
      return res.status(400).json({ code: "invalid_status", message: "Offer nay khong o trang thai co the ky nhan" });
    }

    offer.status = "accepted";
    offer.candidateSignature = value.candidateSignature;
    offer.signedAt = new Date();
    await offer.save();

    return res.status(200).json({ code: "success", message: "Ky nhan offer thanh cong", data: offer });
  } catch (err) {
    console.error("Sign offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};

// Ung vien tu choi offer - PATCH /api/offers/:id/decline
export const declineOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ code: "not_found", message: "Khong tim thay offer" });
    }
    if (String(offer.candidate) !== req.user!.sub) {
      return res.status(403).json({ code: "forbidden", message: "Ban khong co quyen tu choi offer nay" });
    }
    if (offer.status !== "sent") {
      return res.status(400).json({ code: "invalid_status", message: "Offer nay khong o trang thai co the tu choi" });
    }

    offer.status = "declined";
    await offer.save();

    return res.status(200).json({ code: "success", message: "Da tu choi offer", data: offer });
  } catch (err) {
    console.error("Decline offer error:", err);
    return res.status(500).json({ code: "server_error", message: "Co loi xay ra, vui long thu lai sau" });
  }
};