import * as z from 'zod';
import { formatZodIssues } from './validation.formatter';
import { ValidationError } from '../http/errors/validation.error';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
	const parsed = schema.safeParse(data);

	if (!parsed.success) {
		throw new ValidationError(formatZodIssues(parsed.error.issues));
	}

	return parsed.data;
}
