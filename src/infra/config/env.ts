import { EnvSchema } from './env.validation';
import * as z from 'zod';

const configs = EnvSchema.safeParse({
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: process.env.PORT ?? '3001',
	SERVICE_NAME: process.env.SERVICE_NAME ?? 'auth-service',
	LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
	DATABASE_AUTH_URL:
		process.env.DATABASE_AUTH_URL || 'postgresql://user:password@localhost:5432/auth_db',
	DATABASE_AUDIT_URL:
		process.env.DATABASE_AUDIT_URL || 'postgresql://user:password@localhost:5432/audit_db',
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
	SESSION: {
		SESSION_CREATION_ATTEMPTS: process.env.SESSION_CREATION_ATTEMPTS ?? '3',
		ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? '10',
		REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? '7',
		ABSOLUTE_SESSION_TTL: process.env.ABSOLUTE_SESSION_TTL,
		ROTATION_ENABLED: process.env.ROTATION_ENABLED ?? 'false',
		SLIDING_ENABLED: process.env.SLIDING_ENABLED ?? 'false'
	}
});

if (!configs.success) {
	console.error('Server vars validation failed:', z.treeifyError(configs.error));
	throw new Error('Invalid environment variables');
}

export const ENV_CONFIG = configs.data;
