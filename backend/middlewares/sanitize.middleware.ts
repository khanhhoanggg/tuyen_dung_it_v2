import { Request, Response, NextFunction } from "express";

function sanitizeObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue; // bỏ qua key nguy hiểm (NoSQL injection operator)
      }
      clean[key] = sanitizeObject(value);
    }
    return clean;
  }

  return obj;
}

export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};