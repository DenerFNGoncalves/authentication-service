import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LoginService } from '@/application/services/login';
import type { PasswordHasher } from '@/application/ports/password-hasher';
import type { Logger } from '@/application/ports/logger';
import type { UserRepository } from '@/domain/auth/repositories/user';
import { InvalidCredentialsError } from '@/application/errors/invalid-credentials';
import type { Credential } from '@/application/dtos/credential';
import { Email } from '@/domain/auth/value-objects/email';

describe('Login Service', () => {
	let logger: jest.Mocked<Logger>;
	let userRepository: jest.Mocked<UserRepository>;
	let passwordHasher: jest.Mocked<PasswordHasher>;
	let loginService: LoginService;

	beforeEach(() => {
		logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn()
		};

		userRepository = {
			findByEmail: jest.fn()
		} as unknown as jest.Mocked<UserRepository>;

		passwordHasher = {
			compare: jest.fn()
		} as unknown as jest.Mocked<PasswordHasher>;

		loginService = new LoginService(logger, userRepository, passwordHasher);
	});

	it('should login successfully', async () => {
		const credentials: Credential = {
			email: Email.create('unit@test.com'),
			password: 'test123'
		};

		userRepository.findByEmail.mockResolvedValue({
			id: 'test-user-id',
			email: Email.create('unit@test.com'),
			username: 'Test User',
			passwordHash: 'hashedpassword123',
			createdAt: new Date(),
			updatedAt: new Date()
		});

		passwordHasher.compare.mockResolvedValue(true);

		const result = await loginService.validate(credentials);

		expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
		expect(passwordHasher.compare).toHaveBeenCalledWith(credentials.password, 'hashedpassword123');
		expect(result).toEqual({
			id: 'test-user-id',
			email: Email.create('unit@test.com')
		});
	});

	it('should throw InvalidCredentialsError when user is not found', async () => {
		const credentials: Credential = {
			email: Email.create('notfound@test.com'),
			password: 'notfound'
		};
		userRepository.findByEmail.mockResolvedValue(null);

		await expect(loginService.validate(credentials)).rejects.toBeInstanceOf(
			InvalidCredentialsError
		);
		expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);

		expect(logger.warn).toHaveBeenCalledWith('Login attempt failed', {
			event: 'auth.login',
			result: 'failure',
			reason: 'user_not_found',
			email: credentials.email
		});

		expect(passwordHasher.compare).not.toHaveBeenCalled();
	});

	it('should throw InvalidCredentialsError when password is invalid', async () => {
		const credentials: Credential = {
			email: Email.create('unit@test.com'),
			password: 'invalidpassword'
		};
		userRepository.findByEmail.mockResolvedValue({
			id: 'test-user-id',
			email: Email.create('unit@test.com'),
			username: 'Test User',
			passwordHash: 'hashedpassword123',
			createdAt: new Date(),
			updatedAt: new Date()
		});

		passwordHasher.compare.mockResolvedValue(false);

		await expect(loginService.validate(credentials)).rejects.toBeInstanceOf(
			InvalidCredentialsError
		);
		expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
		expect(passwordHasher.compare).toHaveBeenCalledWith(credentials.password, 'hashedpassword123');
		expect(logger.warn).toHaveBeenCalledWith('Login attempt failed', {
			event: 'auth.login',
			result: 'failure',
			reason: 'invalid_password',
			email: credentials.email
		});
	});
});
