import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { env } from "../../Config/env";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (userId !== env.ADMIN_ID) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
}
