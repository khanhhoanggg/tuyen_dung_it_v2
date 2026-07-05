import { Router } from "express";
import {
  createOffer,
  listCompanyOffers,
  listMyOffers,
  getOffer,
  updateOffer,
  sendOffer,
  withdrawOffer,
  signOffer,
  declineOffer,
} from "../controllers/offer.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/applications/:applicationId/offers",
  requireAuth,
  requireRole("company", "admin"),
  createOffer
);

router.get("/offers/company/mine", requireAuth, requireRole("company", "admin"), listCompanyOffers);
router.get("/offers/mine", requireAuth, requireRole("candidate"), listMyOffers);
router.get("/offers/:id", requireAuth, getOffer);

router.put("/offers/:id", requireAuth, requireRole("company", "admin"), updateOffer);
router.patch("/offers/:id/send", requireAuth, requireRole("company", "admin"), sendOffer);
router.patch("/offers/:id/withdraw", requireAuth, requireRole("company", "admin"), withdrawOffer);

router.patch("/offers/:id/sign", requireAuth, requireRole("candidate"), signOffer);
router.patch("/offers/:id/decline", requireAuth, requireRole("candidate"), declineOffer);

export default router;