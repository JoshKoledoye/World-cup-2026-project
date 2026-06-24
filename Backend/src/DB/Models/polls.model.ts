import mongoose from "mongoose";

const pollsSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        votes: { type: Number, default: 0, min: 0 },
      },
    ],
  },
  { timestamps: true, strict: true },
);

pollsSchema.set("toJSON", {
  transform: (doc, obj) => {
    const { _id, __v, ...rest } = obj;
    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

const Poll = mongoose.model("Poll", pollsSchema, "polls");

export default Poll;
