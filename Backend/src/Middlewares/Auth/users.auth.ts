import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Use `getAuth()` to get the user's `userId`

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
