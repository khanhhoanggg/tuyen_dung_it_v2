import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service";

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

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code: "unauthorized",
      message: "Ban can dang nhap de thuc hien thao tac nay",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      code: "invalid_token",
      message: "Phien dang nhap da het han hoac khong hop le",
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Ban can dang nhap de thuc hien thao tac nay",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: "forbidden",
        message: "Ban khong co quyen thuc hien thao tac nay",
      });
    }

    next();
  };
};
