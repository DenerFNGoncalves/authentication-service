import { ENV_CONFIG } from './env';

export type LoggerConfig = {
	level: string;
	base: {
		serviceName: string;
		env: string;
	};
};

function getLogLevel(levelString: string): string {
	const validLevels = ['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'];
	if (validLevels.includes(levelString)) {
		return levelString;
	}

	console.warn(`Invalid LOG_LEVEL "${levelString}" provided. Falling back to "info".`);
	return 'info';
}

export function loadLoggerConfig(): LoggerConfig {
	return Object.freeze({
		level: getLogLevel(ENV_CONFIG.LOG_LEVEL),
		base: {
			serviceName: ENV_CONFIG.SERVICE_NAME,
			env: ENV_CONFIG.NODE_ENV
		}
	});
}
