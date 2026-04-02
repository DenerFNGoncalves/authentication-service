import type { AuditEventService } from '@/application/ports/audit/audit-event.service';
import type { LoginService } from '../services/login';
import type { SessionService } from '../services/session';
import type { AccessTokenGenerator } from '../ports/access-token-generator';

import type { Credential } from '../dtos/credential';
import type { SessionTokens } from '../dtos/session-tokens';
import type { Logger } from '../ports/logger';
import { UserLoggedInEvent } from '@/domain/auth/events/user-logged-in';
import { SessionCreatedEvent } from '@/domain/auth/events/session-created';

export class LoginUseCase {
	constructor(
		private readonly logger: Logger,
		private readonly loginService: LoginService,
		private readonly sessionService: SessionService,
		private readonly accessTokenService: AccessTokenGenerator,
		private readonly auditEventService: AuditEventService
	) {}

	async execute(credential: Credential): Promise<SessionTokens> {
		// future feat: add to telemetry system this attempt
		this.logger.info('Login attempt', {
			event: 'auth.login',
			stage: 'attempt',
			email: credential.email
		});

		const user = await this.loginService.validate(credential);
		await this.auditEventService.record(UserLoggedInEvent.create(user.id)).catch((error) => {
			this.logger.error('Failed to record UserLoggedInEvent', {
				event: 'audit.record',
				err: error
			});
		});

		const session = await this.sessionService.create(user.id);
		await this.auditEventService
			.record(SessionCreatedEvent.create(user.id, session.sessionId))
			.catch((error) => {
				this.logger.error('Failed to record SessionCreatedEvent', {
					event: 'audit.record',
					err: error
				});
			});

		const result = this.accessTokenService.createAccessToken(user.id, session.sessionId);

		this.logger.info('Login successful', {
			event: 'auth.login',
			result: 'success',
			userId: user.id,
			sessionId: session.sessionId
		});

		return {
			accessToken: result.accessToken,
			refreshToken: session.refreshToken,
			expiresIn: result.expiresIn
		};
	}
}
