import { Router } from "express";
import { clerkClient } from "@clerk/express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "There's nothing here yet, check back later :)",
  });
});

router.get("/admin", async (req, res) => {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 100,
      offset: 0,
    });

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
