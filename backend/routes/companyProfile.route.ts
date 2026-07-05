import { Router } from "express";
import {
  getMyCompanyProfile,
  upsertMyCompanyProfile,
} from "../controllers/companyProfile.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, requireRole("company"), getMyCompanyProfile);
router.put("/me", requireAuth, requireRole("company"), upsertMyCompanyProfile);

export default router;