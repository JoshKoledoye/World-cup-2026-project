import { Router } from "express";
import validate from "express-zod-safe";
import { PollSchema } from "../Schemas/polls.schema";
import { pollCreateController } from "../Controllers/polls.controller";

const router = Router();

router.post("/", validate({ body: PollSchema }), pollCreateController);

export default router;
