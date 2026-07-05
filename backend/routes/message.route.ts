import { Router } from "express";
import {
  sendMessage,
  getConversation,
  listCompanyConversations,
} from "../controllers/message.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/applications/:applicationId/messages", requireAuth, sendMessage);
router.get("/applications/:applicationId/messages", requireAuth, getConversation);
router.get(
  "/messages/company/conversations",
  requireAuth,
  requireRole("company", "admin"),
  listCompanyConversations
);

export default router;