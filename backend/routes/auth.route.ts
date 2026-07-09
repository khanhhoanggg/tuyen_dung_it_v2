import { Router } from "express";
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.get("/verify", verifyEmail);
router.post("/resend-verification", authRateLimiter, resendVerification);

export default router;