import { Request, Response } from "express";
import { addPoll } from "../Services/polls.service";

export const pollCreateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { poll } = req.body;

    const result = await addPoll(poll);

    if (!result.success) {
      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }

    res.status(201).json({ success: true, message: 'Poll created' });
  } catch (err) {
    // keep this minimal; ramp up structured logging separately
    // eslint-disable-next-line no-console
    console.error('pollCreateController error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};