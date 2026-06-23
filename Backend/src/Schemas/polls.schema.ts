import { z } from "zod";

export const PollOptionSchema = z.object({
	text: z.string(),
	votes: z.number().int().nonnegative(),
});

export const PollSchema = z.object({
	id: z.string().optional(),
	question: z.string(),
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

export const PollsSchema = z.array(PollSchema);

export type Poll = z.infer<typeof PollSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
