import { Poll } from "../Types/index";
import pollsCollection from "../DB/Models/polls.model";

export const addPoll = async (poll: Poll): Promise<{ success: boolean }> => {
  try {
    // Only admins can add polls by the way. 

    // We'll implement that tmr. 

    const newPoll = await pollsCollection.create(poll);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
