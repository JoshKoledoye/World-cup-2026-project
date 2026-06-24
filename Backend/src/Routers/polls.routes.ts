import { Router } from "express";
import validate from "express-zod-safe";
import {
  PollIdParamsSchema,
  PollSchema,
  PollUpdateSchema,
  PollVoteSchema,
} from "../Schemas/polls.schema";
import {
  pollCreateController,
  pollDeleteController,
  pollGetController,
  pollListController,
  pollUpdateController,
  pollVoteController,
} from "../Controllers/polls.controller";
import { requireAdmin } from "../Middlewares/Auth/admin.auth";

const router = Router();

router.get("/", pollListController);
router.get("/:id", validate({ params: PollIdParamsSchema }), pollGetController);
router.post(
  "/",
  requireAdmin,
  validate({ body: PollSchema }),
  pollCreateController,
);

router.put(
  "/:id",
  requireAdmin,
  validate({ params: PollIdParamsSchema, body: PollUpdateSchema }),
  pollUpdateController,
);

router.patch(
  "/:id/vote",
  validate({ params: PollIdParamsSchema, body: PollVoteSchema }),
  pollVoteController,
);

router.delete(
  "/:id",
  requireAdmin,
  validate({ params: PollIdParamsSchema }),
  pollDeleteController,
);

export default router;
