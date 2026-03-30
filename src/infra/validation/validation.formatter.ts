import * as z from 'zod';

export function formatZodIssues(issues: z.core.$ZodIssue[]): Record<string, string> {
	if (!issues || issues.length === 0) {
		return {};
	}

	return issues.reduce(
		(result, issue) => {
			const path = issue.path.join('.');

			result[path] = issue.message;
			return result;
		},
		{} as Record<string, string>
	);
}
