import { z } from "zod";
import { Types } from "mongoose";

/**
 * Reusable validator that leverages Mongoose's native verification
 * this mirrors what a mongoose ObjectId looks like, and uses mongoose's built in validation to ensure it's valid
 * @returns a zod schema that validates a string as a valid mongoose ObjectId
 */
export const zObjectId = () =>
  z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid Mongoose ObjectId",
  });
