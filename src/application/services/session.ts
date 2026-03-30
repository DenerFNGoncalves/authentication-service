import type { PasswordHasher } from '../ports/password-hasher';
import type { TokenGenerator } from '../ports/token-generator';
import type { SessionRepository } from '@/domain/repositories/session';
import type { Session } from '@/domain/entities/session';
import { DuplicateEntityError } from '@/domain/errors/duplicate-entity-error';
import { SessionCreationError } from '../errors/session-creation-error';
import type { Logger } from '../ports/logger';
import { Time, type Days, type Milliseconds } from '@/domain/value-objects/time';

export interface CreatedSession {
	sessionId: string;
	refreshToken: string;
	expiresAt: Date;
}

export interface SessionServiceConfig {
	creationAttempts: number;
	refreshTokenTtl: Days;
	absoluteSessionTtl: Days | undefined;
}

const getExpirationDays = (ttl: Days | undefined): Date | null => {
	if (ttl === undefined) {
		return null;
	}

	const ttlMs = Time.days.toMilliseconds(ttl);
	return new Date(Date.now() + ttlMs);
};

export class SessionService {
	constructor(
		private readonly logger: Logger,
		private readonly sessionRepository: SessionRepository,
		private readonly tokenGenerator: TokenGenerator,
		private readonly passwordHasher: PasswordHasher,
		private readonly sessionConfigs: SessionServiceConfig
	) {}

	async create(userId: string): Promise<CreatedSession> {
		const refreshToken = this.tokenGenerator.generate();
		const session = await this.createSession(userId, refreshToken);

		this.logger.info('Session created', {
			userId,
			sessionId: session.id,
			expiresAt: session.expiresAt,
			event: 'auth.session.create',
			result: 'success'
		});

		return {
			sessionId: session.id,
			expiresAt: session.expiresAt,
			refreshToken
		};
	}

	private async createSession(userId: string, refreshToken: string): Promise<Session> {
		const attempts = this.sessionConfigs.creationAttempts;

		const { absoluteSessionTtl, refreshTokenTtl } = this.sessionConfigs;

		for (let attempt = 0; attempt < attempts; attempt++) {
			try {
				this.logger.info('Attempting to create session', {
					userId,
					attempt: attempt + 1,
					event: 'auth.session.create',
					stage: 'attempt'
				});
				const refreshTokenHash = await this.passwordHasher.hash(refreshToken);

				const session = await this.sessionRepository.create({
					userId,
					refreshTokenHash,
					expiresAt: getExpirationDays(refreshTokenTtl) as Date,
					absoluteExpiresAt: getExpirationDays(absoluteSessionTtl) as Date | null
				});

				return session;
			} catch (error) {
				if (error instanceof DuplicateEntityError) {
					this.logger.warn('Duplicate session detected, retrying session creation', {
						userId,
						attempt: attempt + 1,
						event: 'auth.session.create',
						result: 'failure',
						reason: 'duplicate_session'
					});
					continue;
				}

				this.logger.error('Unexpected error during session creation', {
					userId,
					attempt: attempt + 1,
					event: 'auth.session.create',
					result: 'failure',
					err: error
				});
				throw new SessionCreationError();
			}
		}

		this.logger.error('Failed to create session after maximum attempts', {
			userId,
			attempt: attempts + 1,
			event: 'auth.session.create',
			result: 'failure',
			reason: 'max_attempts_reached',
			err: new Error(
				`Failed to create session for user ${userId} after ${this.sessionConfigs.creationAttempts} attempts`
			)
		});
		throw new SessionCreationError();
	}
}
