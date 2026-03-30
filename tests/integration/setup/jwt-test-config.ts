import { Time } from '@/domain/value-objects/time';

export const jwtTestConfig = {
	accessSecret: 'integration-test-secret',
	expiresIn: Time.minutes(3)
};
