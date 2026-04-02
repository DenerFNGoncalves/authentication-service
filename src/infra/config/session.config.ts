import { Time, type Days, type Minutes } from '@/domain/auth/value-objects/time';
import { ENV_CONFIG } from './env';

export type SessionConfig = {
	creationAttempts: number;
	accessTokenTtl: Minutes;
	refreshTokenTtl: Days;
	absoluteSessionTtl?: Days;
	rotationEnabled: boolean;
	slidingEnabled: boolean;
};

const defaultValues = Object.freeze({
	creationAttempts: 3,
	accessTokenTtl: Time.minutes(15),
	refreshTokenTtl: Time.days(7)
});

const getConfigValue = <T>(
	value: number | undefined,
	parser: (input: number) => T,
	defaultValue: T
): T => {
	if (value === undefined) {
		return defaultValue;
	}
	return parser(value);
};

export function loadSessionConfig(): SessionConfig {
	const absoluteSessionTtl = getConfigValue(
		ENV_CONFIG.SESSION.ABSOLUTE_SESSION_TTL,
		(value) => Time.days(value),
		undefined
	);

	const creationAttempts = getConfigValue(
		ENV_CONFIG.SESSION.SESSION_CREATION_ATTEMPTS,
		(value) => value,
		defaultValues.creationAttempts
	);

	const accessTokenTtl = getConfigValue(
		ENV_CONFIG.SESSION.ACCESS_TOKEN_TTL,
		(value) => Time.minutes(value),
		defaultValues.accessTokenTtl
	);

	const refreshTokenTtl = getConfigValue(
		ENV_CONFIG.SESSION.REFRESH_TOKEN_TTL,
		(value) => Time.days(value),
		defaultValues.refreshTokenTtl
	);

	return Object.freeze({
		creationAttempts,
		accessTokenTtl,
		refreshTokenTtl,
		rotationEnabled: ENV_CONFIG.SESSION.ROTATION_ENABLED,
		slidingEnabled: ENV_CONFIG.SESSION.SLIDING_ENABLED,
		...(absoluteSessionTtl && { absoluteSessionTtl })
	});
}
