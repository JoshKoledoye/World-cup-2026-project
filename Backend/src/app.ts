// Main
import express, { Request, Response } from "express";

// Middlewares
import cors from "cors";
import authMiddleware from "./Middlewares/Auth/users.auth";

//Routers
import userRouter from "./Routers/users.routes";

// Init
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sultan2403.github.io"],
  }),
);

app.use(express.json());

// app.use(authMiddleware);
app.use("/users", userRouter);

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
