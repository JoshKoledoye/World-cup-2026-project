import { z } from "zod";

export const PollOptionSchema = z.object({
	text: z.string().trim().min(1, "Option text is required"),
	votes: z.number().int().nonnegative().default(0),
});

export const PollSchema = z.object({
	id: z.string().optional(),
	question: z.string().trim().min(1, "Question is required"),
	options: z.array(PollOptionSchema).min(2),
	// createdAt is optional when creating; normalize strings/numbers to Date when present
	createdAt: z
		.preprocess((arg) => {
			if (arg instanceof Date) return arg as Date;
			if (typeof arg === 'string' || typeof arg === 'number') {
				const d = new Date(String(arg));
				return isNaN(d.getTime()) ? undefined : d;
			}
			return undefined;
		}, z.date())
		.optional(),
	// updatedAt is optional; normalize strings/numbers to Date when present
	updatedAt: z
		.preprocess((arg) => {
			if (arg instanceof Date) return arg as Date;
			if (typeof arg === 'string' || typeof arg === 'number') {
				const d = new Date(String(arg));
				return isNaN(d.getTime()) ? undefined : d;
			}
			return undefined;
		}, z.date())
		.optional(),
});

export const PollUpdateSchema = PollSchema.pick({
	question: true,
	options: true,
}).partial().refine((poll) => poll.question !== undefined || poll.options !== undefined, {
	message: "At least one poll field is required",
});

export const PollIdParamsSchema = z.object({
	id: z.string().min(1, "Poll id is required"),
});

export const PollVoteSchema = z.object({
	optionIndex: z.number().int().nonnegative(),
});

export const PollsSchema = z.array(PollSchema);

export type Poll = z.infer<typeof PollSchema>;
export type PollUpdate = z.infer<typeof PollUpdateSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
