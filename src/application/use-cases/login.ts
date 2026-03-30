import type { LoginService } from '../services/login';
import type { SessionService } from '../services/session';
import type { AccessTokenGenerator } from '../ports/access-token-generator';

import type { Credential } from '../dtos/credential';
import type { SessionTokens } from '../dtos/session-tokens';
import type { Logger } from '../ports/logger';

export class LoginUseCase {
	constructor(
		private readonly logger: Logger,
		private readonly loginService: LoginService,
		private readonly sessionService: SessionService,
		private readonly accessTokenService: AccessTokenGenerator
	) {}

	async execute(credential: Credential): Promise<SessionTokens> {
		this.logger.info('Login attempt', {
			event: 'auth.login',
			stage: 'attempt',
			email: credential.email
		});

		const user = await this.loginService.validate(credential);
		const session = await this.sessionService.create(user.id);

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
