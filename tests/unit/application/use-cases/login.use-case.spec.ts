import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LoginUseCase } from '@/application/use-cases/login';

import type { LoginService } from '@/application/services/login';
import type { SessionService } from '@/application/services/session';
import type { AccessTokenGenerator } from '@/application/ports/access-token-generator';
import type { Logger } from '@/application/ports/logger';
import type { Credential } from '@/application/dtos/credential';
import { Time } from '@/domain/value-objects/time';
import { Email } from '@/domain/value-objects/email';

describe('LoginUseCase', () => {
	let logger: jest.Mocked<Logger>;
	let loginService: jest.Mocked<LoginService>;
	let sessionService: jest.Mocked<SessionService>;
	let accessTokenService: jest.Mocked<AccessTokenGenerator>;
	let useCase: LoginUseCase;

	beforeEach(() => {
		logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn()
		};

		loginService = {
			validate: jest.fn()
		} as unknown as jest.Mocked<LoginService>;

		sessionService = {
			create: jest.fn()
		} as unknown as jest.Mocked<SessionService>;

		accessTokenService = {
			createAccessToken: jest.fn()
		} as unknown as jest.Mocked<AccessTokenGenerator>;

		useCase = new LoginUseCase(logger, loginService, sessionService, accessTokenService);
	});

	it('should authenticate user and return access and refresh tokens', async () => {
		const credentials: Credential = {
			email: Email.create('unit@test.com'),
			password: 'test123'
		};

		loginService.validate.mockResolvedValue({
			id: 'test-user-id',
			email: Email.create('unit@test.com')
		});

		sessionService.create.mockResolvedValue({
			sessionId: 'session-456',
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			refreshToken: 'refresh-token-abc'
		});

		accessTokenService.createAccessToken.mockReturnValue({
			accessToken: 'access-token-xyz',
			expiresIn: Time.minutes(15)
		});

		const result = await useCase.execute(credentials);

		expect(loginService.validate).toHaveBeenCalledWith(credentials);
		expect(sessionService.create).toHaveBeenCalledWith('test-user-id');
		expect(accessTokenService.createAccessToken).toHaveBeenCalledWith(
			'test-user-id',
			'session-456'
		);
		expect(logger.info).toHaveBeenNthCalledWith(1, 'Login attempt', {
			event: 'auth.login',
			stage: 'attempt',
			email: 'unit@test.com'
		});
		expect(logger.info).toHaveBeenNthCalledWith(2, 'Login successful', {
			event: 'auth.login',
			result: 'success',
			userId: 'test-user-id',
			sessionId: 'session-456'
		});

		expect(result).toEqual({
			accessToken: 'access-token-xyz',
			refreshToken: 'refresh-token-abc',
			expiresIn: Time.minutes(15)
		});
	});
});
