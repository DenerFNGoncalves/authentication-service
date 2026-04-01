import { ENV_CONFIG } from '@/infra/config/env';

export type ServerConfig = {
	port: number;
	env: string;
	name: string;
};

export function loadServerConfig(): ServerConfig {
	return Object.freeze({
		port: ENV_CONFIG.PORT,
		env: ENV_CONFIG.NODE_ENV,
		name: ENV_CONFIG.SERVICE_NAME
	});
}
