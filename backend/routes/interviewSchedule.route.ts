import { Router } from "express";
import {
  createInterview,
  listCompanyInterviews,
  listMyInterviews,
  updateInterview,
} from "../controllers/interviewSchedule.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/applications/:applicationId/interviews",
  requireAuth,
  requireRole("company", "admin"),
  createInterview
);
router.get(
  "/interviews/company/mine",
  requireAuth,
  requireRole("company", "admin"),
  listCompanyInterviews
);
router.get("/interviews/mine", requireAuth, requireRole("candidate"), listMyInterviews);
router.put(
  "/interviews/:id",
  requireAuth,
  requireRole("company", "admin"),
  updateInterview
);

export default router;