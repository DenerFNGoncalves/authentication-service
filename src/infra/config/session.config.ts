import { Time, type Days, type Minutes } from '@/domain/value-objects/time';
import { SECURITY } from './env';

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
	value: string | undefined,
	parser: (input: string) => T,
	defaultValue: T
): T => {
	if (value === undefined) {
		return defaultValue;
	}
	return parser(value);
};

export function loadSessionConfig(): SessionConfig {
	const absoluteSessionTtl = getConfigValue(
		SECURITY.SESSION.ABSOLUTE_SESSION_TTL,
		(value) => Time.days(Number(value)),
		undefined
	);

	const creationAttempts = getConfigValue(
		SECURITY.SESSION.SESSION_CREATION_ATTEMPTS,
		(value) => parseInt(value),
		defaultValues.creationAttempts
	);

	const accessTokenTtl = getConfigValue(
		SECURITY.SESSION.ACCESS_TOKEN_TTL,
		(value) => Time.minutes(Number(value)),
		defaultValues.accessTokenTtl
	);

	const refreshTokenTtl = getConfigValue(
		SECURITY.SESSION.REFRESH_TOKEN_TTL,
		(value) => Time.days(Number(value)),
		defaultValues.refreshTokenTtl
	);

	return Object.freeze({
		creationAttempts,
		accessTokenTtl,
		refreshTokenTtl,
		rotationEnabled: SECURITY.SESSION.SESSION_ROTATION_ENABLED,
		slidingEnabled: SECURITY.SESSION.SESSION_SLIDING_ENABLED,
		...(absoluteSessionTtl && { absoluteSessionTtl })
	});
}
