import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service";

// Mở rộng trực tiếp kiểu Request gốc của Express toàn cục (Global)
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: string;
        tokenVersion: number;
      };
    }
  }
}

// Thay thế AuthRequest bằng Request chuẩn của Express
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code: "unauthorized",
      message: "Bạn cần đăng nhập để thực hiện thao tác này",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // OK! TypeScript đã hiểu req.user mà không cần ép kiểu
    next();
  } catch (error) {
    return res.status(401).json({
      code: "invalid_token",
      message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: "forbidden",
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }

    next();
  };
};