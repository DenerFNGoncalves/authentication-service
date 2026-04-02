import {
	setupTestDatabase,
	teardownTestDatabase
} from '@tests/integration/infra/database/auth/setup/auth-test-database';
import { DrizzleUserRepository } from '@/infra/database/auth/drizzle/repositories/user';
import { DrizzleSessionRepository } from '@/infra/database/auth/drizzle/repositories/session';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { BcryptPasswordHasher } from '@/infra/security/bcrypt-password-hasher';
import { JwtAccessTokenGenerator } from '@/infra/security/jwt-access-token-generator';
import { jwtTestConfig } from '@tests/integration/infra/setup/jwt-test-config';
import { LoginUseCase } from '@/application/use-cases/login';
import { LoginService } from '@/application/services/login';
import { SessionService } from '@/application/services/session';
import { CryptoTokenGenerator } from '@/infra/security/crypto-token-generator';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { schema } from '@/infra/database/auth/drizzle/schemas/runtime';
import { sessions, users } from '@/infra/database/auth/drizzle/schemas';
import type { Logger } from '@/application/ports/logger';
import { Time } from '@/domain/auth/value-objects/time';
import { Email } from '@/domain/auth/value-objects/email';

jest.setTimeout(30000);

describe('LoginUseCase (integration)', () => {
	let db: PostgresJsDatabase<typeof schema>;
	let loginUseCase: LoginUseCase;
	let logger: jest.Mocked<Logger>;

	beforeAll(async () => {
		db = await setupTestDatabase();
		logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn()
		};

		const userRepository = new DrizzleUserRepository(db);
		const passwordHasher = new BcryptPasswordHasher();
		const loginService = new LoginService(logger, userRepository, passwordHasher);

		const tokenGenerator = new CryptoTokenGenerator();
		const sessionRepository = new DrizzleSessionRepository(logger, db);
		const accessTokenGenerator = new JwtAccessTokenGenerator(jwtTestConfig);
		const sessionService = new SessionService(
			logger,
			sessionRepository,
			tokenGenerator,
			passwordHasher,
			{
				creationAttempts: 3,
				refreshTokenTtl: Time.days(15),
				absoluteSessionTtl: Time.days(30)
			}
		);

		loginUseCase = new LoginUseCase(logger, loginService, sessionService, accessTokenGenerator);
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	it('should create a session when credentials are valid', async () => {
		const password = '123456';
		const passwordHasher = new BcryptPasswordHasher();
		const hashed = await passwordHasher.hash(password);
		const email = Email.create('test1@test.com');

		const insertedUsers = await db
			.insert(users)
			.values({
				username: 'Test User 1',
				email: email,
				passwordHash: hashed
			})
			.returning();

		expect(insertedUsers.length || 0).toBeGreaterThan(0);

		await loginUseCase.execute({
			email,
			password
		});

		expect(logger.info).toHaveBeenCalledWith('Login attempt', {
			event: 'auth.login',
			stage: 'attempt',
			email
		});

		expect(logger.info).toHaveBeenCalledWith(
			'Login successful',
			expect.objectContaining({
				event: 'auth.login',
				result: 'success'
			})
		);

		const sessionsInDb = await db.select().from(sessions);
		expect(sessionsInDb.length || 0).toBeGreaterThan(0);

		const sessionUserId = sessionsInDb[0]?.userId || 'invalid-relation-userid';
		const userId = insertedUsers[0]?.id || 'invalid-user-id';

		expect(sessionUserId).toBe(userId);
	});
});
