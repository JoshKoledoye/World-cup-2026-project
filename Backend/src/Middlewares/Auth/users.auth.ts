import jwt from "jsonwebtoken";
import { env } from "../../Config/env.js";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../../Types/user.types.js";

const JWT_SECRET = env.JWT_ACCESS_SECRET;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded; // attach user info to request
    next(); // proceed to the controller
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
