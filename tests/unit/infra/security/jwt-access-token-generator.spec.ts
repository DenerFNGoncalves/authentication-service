import { describe, it, expect, beforeAll } from '@jest/globals';
import { JwtAccessTokenGenerator } from '@/infra/security/jwt-access-token-generator';
import { verify as jwtVerifyToken } from 'jsonwebtoken';
import { Time, type Minutes } from '@/domain/value-objects/time';

describe('JwtAccessTokenGenerator', () => {
	let jwtConfig: { accessSecret: string; expiresIn: Minutes };
	let jwtGenerator: JwtAccessTokenGenerator;

	beforeAll(() => {
		jwtConfig = {
			accessSecret: 'test-secret',
			expiresIn: Time.minutes(1)
		};

		jwtGenerator = new JwtAccessTokenGenerator(jwtConfig);
	});

	it('should create a valid JWT access token', () => {
		const userId = 'test-user-id';
		const sessionId = 'test-session-id';

		const accessTokenResult = jwtGenerator.createAccessToken(userId, sessionId);

		const { accessToken, expiresIn } = accessTokenResult;

		expect(typeof accessToken).toBe('string');
		const decoded = jwtVerifyToken(accessToken, jwtConfig.accessSecret) as {
			sub: string;
			sid: string;
		};

		expect(decoded.sub).toBe(userId);
		expect(decoded.sid).toBe(sessionId);
		expect(expiresIn).toBe(Time.minutes(jwtConfig.expiresIn));
	});
});
