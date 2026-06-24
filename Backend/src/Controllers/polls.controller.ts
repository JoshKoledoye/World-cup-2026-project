import { Request, Response } from "express";
import {
  addPoll,
  deletePoll,
  getPollById,
  getPolls,
  updatePoll,
  votePollOption,
} from "../Services/polls.service";

const sendPollError = (
  res: Response,
  error = "Something went wrong",
): void => {
  const statusCode =
    error.includes("Invalid") || error.includes("required")
      ? 400
      : error.includes("not found")
        ? 404
        : 500;

  res.status(statusCode).json({ success: false, error });
};

const getPollId = (req: Request): string => String(req.params.id);

export const pollListController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const result = await getPolls();

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(200).json({ success: true, polls: result.polls });
};

export const pollGetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getPollById(getPollId(req));

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(200).json({ success: true, poll: result.poll });
};

export const pollCreateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await addPoll(req.body);

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(201).json({
    success: true,
    message: "Poll created",
    poll: result.poll,
  });
};

export const pollUpdateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await updatePoll(getPollId(req), req.body);

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(200).json({
    success: true,
    message: "Poll updated",
    poll: result.poll,
  });
};

export const pollVoteController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await votePollOption(getPollId(req), req.body.optionIndex);

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(200).json({
    success: true,
    message: "Vote recorded",
    poll: result.poll,
  });
};

export const pollDeleteController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await deletePoll(getPollId(req));

  if (!result.success) {
    sendPollError(res, result.error);
    return;
  }

  res.status(200).json({
    success: true,
    message: "Poll deleted",
    poll: result.poll,
  });
};
