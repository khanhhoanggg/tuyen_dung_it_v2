import { Router } from "express";
import {
  getMyPreference,
  upsertMyPreference,
} from "../controllers/candidatePreference.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, requireRole("candidate"), getMyPreference);
router.put("/me", requireAuth, requireRole("candidate"), upsertMyPreference);

export default router;