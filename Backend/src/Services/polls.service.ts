import mongoose from "mongoose";
import { Poll, PollUpdate } from "../Types/index";
import pollsCollection from "../DB/Models/polls.model";

type PollResult = {
  success: boolean;
  poll?: unknown;
  polls?: unknown[];
  error?: string;
};

const isValidPollId = (pollID: string): boolean =>
  mongoose.Types.ObjectId.isValid(pollID);

export const getPolls = async (): Promise<PollResult> => {
  try {
    const polls = await pollsCollection.find().sort({ createdAt: -1 }).exec();
    return { success: true, polls };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch polls" };
  }
};

export const getPollById = async (pollID: string): Promise<PollResult> => {
  try {
    if (!isValidPollId(pollID)) {
      return { success: false, error: "Invalid poll id" };
    }

    const poll = await pollsCollection.findById(pollID).exec();
    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    return { success: true, poll };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch poll" };
  }
};

export const addPoll = async (poll: Poll): Promise<PollResult> => {
  try {
    // Only admins should add polls once auth roles are wired in.
    const newPoll = await pollsCollection.create(poll);
    return { success: true, poll: newPoll };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create poll" };
  }
};

export const updatePoll = async (
  pollID: string,
  poll: PollUpdate,
): Promise<PollResult> => {
  try {
    if (!isValidPollId(pollID)) {
      return { success: false, error: "Invalid poll id" };
    }

    const updatedPoll = await pollsCollection
      .findByIdAndUpdate(pollID, poll, { new: true, runValidators: true })
      .exec();

    if (!updatedPoll) {
      return { success: false, error: "Poll not found" };
    }

    return { success: true, poll: updatedPoll };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update poll" };
  }
};

export const votePollOption = async (
  pollID: string,
  optionIndex: number,
): Promise<PollResult> => {
  try {
    if (!isValidPollId(pollID)) {
      return { success: false, error: "Invalid poll id" };
    }

    const poll = await pollsCollection.findById(pollID).exec();
    if (!poll) {
      return { success: false, error: "Poll not found" };
    }

    if (!poll.options?.[optionIndex]) {
      return { success: false, error: "Poll option not found" };
    }

    const updatedPoll = await pollsCollection
      .findByIdAndUpdate(
        pollID,
        { $inc: { [`options.${optionIndex}.votes`]: 1 } },
        { new: true, runValidators: true },
      )
      .exec();

    return { success: true, poll: updatedPoll };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to vote on poll" };
  }
};

export const deletePoll = async (pollID: string): Promise<PollResult> => {
  try {
    if (!isValidPollId(pollID)) {
      return { success: false, error: "Invalid poll id" };
    }

    const deletedPoll = await pollsCollection.findByIdAndDelete(pollID).exec();
    if (!deletedPoll) {
      return { success: false, error: "Poll not found" };
    }

    return { success: true, poll: deletedPoll };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete poll" };
  }
};
