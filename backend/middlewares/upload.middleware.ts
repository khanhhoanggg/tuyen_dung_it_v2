import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "cv");

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req: Request, file, cb) => {
    // Đặt tên file theo userId để dễ tìm + tránh trùng tên
    const ext = path.extname(file.originalname);
    const userId = req.user!.sub;
    cb(null, `${userId}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chi chap nhan file PDF hoac Word (.doc, .docx)"));
  }
};

export const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB
});