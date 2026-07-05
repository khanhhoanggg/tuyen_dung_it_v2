import { Router } from "express";
import {
  listJobs,
  getJob,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/job.controller";
import { applyToJob, getJobApplications } from "../controllers/application.controller";
import { saveJob, unsaveJob, trackViewJob } from "../controllers/candidateJobActivity.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { inviteCandidate, listJobInvitations } from "../controllers/jobInvitation.controller";

const router = Router();

router.get("/", listJobs);
router.get("/mine/list", requireAuth, requireRole("company", "admin"), getMyJobs);
router.get("/:id", getJob);

router.post("/", requireAuth, requireRole("company", "admin"), createJob);
router.put("/:id", requireAuth, requireRole("company", "admin"), updateJob);
router.delete("/:id", requireAuth, requireRole("company", "admin"), deleteJob);

router.post("/:jobId/apply", requireAuth, requireRole("candidate"), applyToJob);
router.get(
  "/:jobId/applications",
  requireAuth,
  requireRole("company", "admin"),
  getJobApplications
);

router.post("/:jobId/save", requireAuth, requireRole("candidate"), saveJob);
router.delete("/:jobId/save", requireAuth, requireRole("candidate"), unsaveJob);
router.post("/:jobId/view", requireAuth, requireRole("candidate"), trackViewJob);
router.post("/:jobId/invitations", requireAuth, requireRole("company"), inviteCandidate);
router.get("/:jobId/invitations", requireAuth, requireRole("company"), listJobInvitations);

export default router;