import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // tối đa 10 request/IP trong khung thời gian trên
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "too_many_requests",
    message: "Ban thao tac qua nhieu lan, vui long thu lai sau it phut",
  },
});