export const SERVER = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
	SERVICE_NAME: process.env.SERVICE_NAME ?? 'auth-service',
	LOG_LEVEL: process.env.LOG_LEVEL ?? 'info'
};

export const SECURITY = {
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
	SESSION: Object.freeze({
		SESSION_CREATION_ATTEMPTS: process.env.SESSION_CREATION_ATTEMPTS ?? '3',
		ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? '10',
		REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? '7',
		ABSOLUTE_SESSION_TTL: process.env.ABSOLUTE_SESSION_TTL,
		SESSION_ROTATION_ENABLED: process.env.ROTATION_ENABLED === 'true',
		SESSION_SLIDING_ENABLED: process.env.SLIDING_ENABLED === 'true'
	})
};
