// Main
import express, { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";

// Middlewares
import cors from "cors";

// Routers
import userRouter from "./Routers/users.routes";
import pollsRouter from "./Routers/polls.routes";
import requireAuth from "./Middlewares/Auth/users.auth";

// Init
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sultan2403.github.io"],
  }),
);

app.use(express.json());

app.use(clerkMiddleware());

app.use("/users", userRouter);
app.use("/polls", requireAuth, pollsRouter);

// Routes
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: " Looking for something? Well it's not here XD" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server says heyyy :)" });
});

export default app;
