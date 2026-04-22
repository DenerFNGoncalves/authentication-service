import type { NextFunction, Request, Response } from 'express';
import type { AuditEventService } from '@/application/ports/audit/audit-event.service';
import type { Logger } from '@/application/ports/logger';
import type { UserRepository } from '@/domain/auth/repositories/user';
import type { SessionRepository } from '@/domain/auth/repositories/session';
import type { PasswordHasher } from '@/application/ports/password-hasher';
import type { TokenGenerator } from '@/application/ports/token-generator';
import type { AccessTokenGenerator } from '@/application/ports/access-token-generator';

import { jest } from '@jest/globals';
import { createServer } from '@/bootstrap/create-server';
import { User } from '@/domain/auth/entities/user';
import { Email } from '@/domain/auth/value-objects/email';
import { Time } from '@/domain/auth/value-objects/time';
import { Session } from '@/domain/auth/entities/session';

type CreateTestAppOverrides = {
	logger?: jest.Mocked<Logger>;
	auditEventService?: jest.Mocked<AuditEventService>;
	userRepository?: UserRepository;
	sessionRepository?: SessionRepository;
	passwordHasher?: PasswordHasher;
	tokenGenerator?: TokenGenerator;
	accessTokenGenerator?: AccessTokenGenerator;
};

export const createTestApp = async function (overrides: CreateTestAppOverrides = {}) {
	const db = {
		users: [] as User[],
		sessions: [] as Session[]
	};

	const logger =
		overrides.logger ??
		({
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		fatal: jest.fn()
		} as jest.Mocked<Logger>);

	const auditEventService =
		overrides.auditEventService ??
		({
		record: jest.fn(async () => undefined)
		} as unknown as jest.Mocked<AuditEventService>);

	const userRepository: UserRepository =
		overrides.userRepository ??
		{
		findByEmail: async (email) => {
			if (email !== Email.create('user@test.com')) {
				return null;
			}

			return new User(
				'user-123',
				Email.create('user@test.com'),
				'Test User',
				'hashed:123456',
				new Date('2026-01-01T00:00:00.000Z'),
				new Date('2026-01-01T00:00:00.000Z')
			);
		},
		findById: async () => null
		};

	const passwordHasher: PasswordHasher =
		overrides.passwordHasher ??
		{
		hash: async (plain) => `hashed:${plain}`,
		compare: async (plain, hashed) => hashed === `hashed:${plain}`
		};

	const tokenGenerator: TokenGenerator =
		overrides.tokenGenerator ??
		{
		generate: () => 'refresh-token'
		};

	const sessionRepository: SessionRepository =
		overrides.sessionRepository ??
		{
		create: async (data) => {
			const session = new Session(
				'session-123',
				data.refreshTokenHash,
				data.userId,
				null,
				null,
				null,
				new Date('2026-01-01T00:00:00.000Z'),
				data.expiresAt,
				data.absoluteExpiresAt,
				null,
				new Date('2026-01-01T00:00:00.000Z'),
				new Date('2026-01-01T00:00:00.000Z')
			);

			db.sessions.push(session);
			return session;
		}
		};

	const accessTokenGenerator: AccessTokenGenerator =
		overrides.accessTokenGenerator ??
		{
		createAccessToken: (userId, sessionId) => ({
			accessToken: `access-${userId}-${sessionId}`,
			expiresIn: Time.minutes(15)
		})
		};

	const server = {
		db,
		mocks: {
			logger,
			auditEventService
		},
		app: await createServer({
			applicationOverrides: {
				logger,
				userRepository,
				sessionRepository,
				passwordHasher,
				tokenGenerator,
				accessTokenGenerator,
				auditEventService
			},
			jwsAuthGuard: (_req: Request, _res: Response, next: NextFunction) => next()
		})
	};

	return server;
};
