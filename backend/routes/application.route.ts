import { Router } from "express";
import {
  getMyApplications,
  updateApplicationStatus,
  updateApplicationAts, // moi them
  getCompanyStats,
} from "../controllers/application.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, requireRole("candidate"), getMyApplications);
router.get("/stats", requireAuth, requireRole("company", "admin"), getCompanyStats);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("company", "admin"),
  updateApplicationStatus
);
router.patch(
  "/:id/ats",
  requireAuth,
  requireRole("company", "admin"),
  updateApplicationAts
);

export default router;