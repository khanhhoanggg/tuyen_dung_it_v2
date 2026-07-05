import { Router } from "express";
import {
  listMyCompanyLocations,
  addMyCompanyLocation,
  deleteMyCompanyLocation,
} from "../controllers/companyLocation.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/mine", requireAuth, requireRole("company"), listMyCompanyLocations);
router.post("/mine", requireAuth, requireRole("company"), addMyCompanyLocation);
router.delete("/mine/:id", requireAuth, requireRole("company"), deleteMyCompanyLocation);

export default router;