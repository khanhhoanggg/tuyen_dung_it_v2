import { Router } from "express";
import { listSavedJobs } from "../controllers/savedJob.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireRole("candidate"), listSavedJobs);

export default router;