import { ENV_CONFIG } from './env';

export type JWSConfig = {
	accessSecret: string;
};

export function loadJWSConfig(): JWSConfig {
	return Object.freeze({
		accessSecret: ENV_CONFIG.JWT_ACCESS_SECRET
	});
}
