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

const router = Router();

router.get("/", pollListController);
router.get("/:id", validate({ params: PollIdParamsSchema }), pollGetController);
router.post("/", validate({ body: PollSchema }), pollCreateController);
router.put(
  "/:id",
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
  validate({ params: PollIdParamsSchema }),
  pollDeleteController,
);

export default router;
