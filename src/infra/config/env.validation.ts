import * as z from 'zod';

const ENVIRONMENTS = ['development', 'production'] as const;
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export const EnvSchema = z.object({
	NODE_ENV: z
		.string()
		.trim()
		.toLowerCase()
		.refine((value) => ENVIRONMENTS.includes(value as any), {
			message: 'NODE_ENV must be one of development, production, or test'
		}),
	PORT: z
		.string()
		.trim()
		.min(1, 'PORT is required')
		.transform((value) => parseInt(value, 10)),
	SERVICE_NAME: z.string().trim().min(1, 'SERVICE_NAME is required'),
	LOG_LEVEL: z
		.string()
		.trim()
		.toLowerCase()
		.refine((value) => LOG_LEVELS.includes(value as any), {
			message: 'LOG_LEVEL must be one of debug, info, warn, or error'
		}),
	DATABASE_AUTH_URL: z.string().trim().min(1, 'DATABASE_AUTH_URL is required'),
	DATABASE_AUDIT_URL: z.string().trim().min(1, 'DATABASE_AUDIT_URL is required'),
	JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
	SESSION: z.object({
		SESSION_CREATION_ATTEMPTS: z
			.string()
			.trim()
			.min(1, 'SESSION_CREATION_ATTEMPTS is required')
			.transform((value) => parseInt(value, 10)),
		ACCESS_TOKEN_TTL: z
			.string()
			.trim()
			.min(1, 'ACCESS_TOKEN_TTL is required')
			.transform((value) => parseInt(value, 10)),
		REFRESH_TOKEN_TTL: z
			.string()
			.trim()
			.min(1, 'REFRESH_TOKEN_TTL is required')
			.transform((value) => parseInt(value, 10)),
		ABSOLUTE_SESSION_TTL: z
			.string()
			.trim()
			.optional()
			.transform((value) => (value ? parseInt(value, 10) : undefined)),
		ROTATION_ENABLED: z
			.string()
			.trim()
			.toLowerCase()
			.transform((value) => value === 'true'),
		SLIDING_ENABLED: z
			.string()
			.trim()
			.toLowerCase()
			.transform((value) => value === 'true')
	})
});
