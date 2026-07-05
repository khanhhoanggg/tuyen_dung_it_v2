import { Router } from "express";
import {
  listMyInvitations,
  respondToInvitation,
} from "../controllers/jobInvitation.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/mine", requireAuth, requireRole("candidate"), listMyInvitations);
router.put("/:id/respond", requireAuth, requireRole("candidate"), respondToInvitation);

export default router;