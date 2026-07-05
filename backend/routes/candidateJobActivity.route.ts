import { Router } from "express";
import {
  listSavedJobs,
  listViewedJobs,
} from "../controllers/candidateJobActivity.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/saved", requireAuth, requireRole("candidate"), listSavedJobs);
router.get("/viewed", requireAuth, requireRole("candidate"), listViewedJobs);

export default router;