import * as z from 'zod';

export const LoginSchema = z.object({
	email: z.email().trim().toLowerCase(),
	password: z.string().trim().min(6).max(32)
});
