import { Router } from "express";
import {
  getMyProfile,
  upsertMyProfile,
  uploadMyCv,
} from "../controllers/candidateProfile.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { uploadCv } from "../middlewares/upload.middleware";

const router = Router();

router.get("/me", requireAuth, requireRole("candidate"), getMyProfile);
router.put("/me", requireAuth, requireRole("candidate"), upsertMyProfile);
router.post(
  "/me/cv",
  requireAuth,
  requireRole("candidate"),
  uploadCv.single("cv"), // "cv" là tên field trong form-data khi frontend gửi lên
  uploadMyCv
);

export default router;