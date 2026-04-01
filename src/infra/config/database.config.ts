import { ENV_CONFIG } from './env';

export type DatabaseConfig = {
	url: string;
};

export function loadAuthDbConfig(): DatabaseConfig {
	return Object.freeze({
		url: ENV_CONFIG.DATABASE_AUTH_URL
	});
}

export function loadAuditDbConfig(): DatabaseConfig {
	return Object.freeze({
		url: ENV_CONFIG.DATABASE_AUDIT_URL
	});
}
