import { SERVER } from '@/infra/config/env';

export type ServerConfig = {
	port: number;
	env: string;
	name: string;
};

export function loadServerConfig(): ServerConfig {
	return Object.freeze({
		port: SERVER.PORT,
		env: SERVER.NODE_ENV,
		name: SERVER.SERVICE_NAME
	});
}
