import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LoginUseCase } from '@/application/use-cases/login';

import type { LoginService } from '@/application/services/login';
import type { SessionService } from '@/application/services/session';
import type { AccessTokenGenerator } from '@/application/ports/access-token-generator';
import type { AuditEventService } from '@/application/ports/audit/audit-event.service';
import type { Logger } from '@/application/ports/logger';
import type { Credential } from '@/application/dtos/credential';
import { Time } from '@/domain/auth/value-objects/time';
import { Email } from '@/domain/auth/value-objects/email';
import { InvalidCredentialsError } from '@/application/errors/invalid-credentials';
import { SessionCreationError } from '@/application/errors/session-creation-error';

describe('LoginUseCase', () => {
	let logger: jest.Mocked<Logger>;
	let loginService: jest.Mocked<LoginService>;
	let sessionService: jest.Mocked<SessionService>;
	let accessTokenService: jest.Mocked<AccessTokenGenerator>;
	let auditEventService: jest.Mocked<AuditEventService>;
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

		auditEventService = {
			record: jest.fn(async () => undefined)
		} as unknown as jest.Mocked<AuditEventService>;

		useCase = new LoginUseCase(
			logger,
			loginService,
			sessionService,
			accessTokenService,
			auditEventService
		);
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
		expect(auditEventService.record).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				name: 'UserLoggedIn',
				userId: 'test-user-id'
			})
		);
		expect(auditEventService.record).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				name: 'SessionCreated',
				userId: 'test-user-id',
				sessionId: 'session-456'
			})
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

	it('should keep login successful even when audit recording fails', async () => {
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

		const auditError = new Error('audit unavailable');
		auditEventService.record.mockRejectedValue(auditError);

		const result = await useCase.execute(credentials);
		await new Promise(process.nextTick);

		expect(result).toEqual({
			accessToken: 'access-token-xyz',
			refreshToken: 'refresh-token-abc',
			expiresIn: Time.minutes(15)
		});
		expect(auditEventService.record).toHaveBeenCalledTimes(2);
		expect(logger.error).toHaveBeenNthCalledWith(1, 'Failed to record UserLoggedInEvent', {
			event: 'audit.record',
			err: auditError
		});
		expect(logger.error).toHaveBeenNthCalledWith(2, 'Failed to record SessionCreatedEvent', {
			event: 'audit.record',
			err: auditError
		});
		expect(logger.info).toHaveBeenCalledWith('Login successful', {
			event: 'auth.login',
			result: 'success',
			userId: 'test-user-id',
			sessionId: 'session-456'
		});
	});

	it('should stop the flow when credentials are invalid', async () => {
		const credentials: Credential = {
			email: Email.create('unit@test.com'),
			password: 'wrong-password'
		};

		const error = new InvalidCredentialsError();
		loginService.validate.mockRejectedValue(error);

		await expect(useCase.execute(credentials)).rejects.toThrow(error);

		expect(sessionService.create).not.toHaveBeenCalled();
		expect(accessTokenService.createAccessToken).not.toHaveBeenCalled();
		expect(auditEventService.record).not.toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalledTimes(1);
		expect(logger.info).toHaveBeenCalledWith('Login attempt', {
			event: 'auth.login',
			stage: 'attempt',
			email: 'unit@test.com'
		});
	});

	it('should not generate token or record session event when session creation fails', async () => {
		const credentials: Credential = {
			email: Email.create('unit@test.com'),
			password: 'test123'
		};

		loginService.validate.mockResolvedValue({
			id: 'test-user-id',
			email: Email.create('unit@test.com')
		});

		const error = new SessionCreationError();
		sessionService.create.mockRejectedValue(error);

		await expect(useCase.execute(credentials)).rejects.toThrow(error);

		expect(auditEventService.record).toHaveBeenCalledTimes(1);
		expect(auditEventService.record).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'UserLoggedIn',
				userId: 'test-user-id'
			})
		);
		expect(accessTokenService.createAccessToken).not.toHaveBeenCalled();
		expect(logger.info).not.toHaveBeenCalledWith(
			'Login successful',
			expect.anything()
		);
	});
});
