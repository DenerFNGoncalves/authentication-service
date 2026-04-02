import type { UserRepository } from '@/domain/auth/repositories/user';
import type { PasswordHasher } from '../ports/password-hasher';
import { InvalidCredentialsError } from '../errors/invalid-credentials';
import type { Logger } from '../ports/logger';
import type { Credential } from '../dtos/credential';
import { AuthenticatedUser } from '../dtos/authenticated-user';

export class LoginService {
	constructor(
		private readonly logger: Logger,
		private readonly userRepository: UserRepository,
		private readonly passwordService: PasswordHasher
	) {}

	async validate(credentials: Credential): Promise<AuthenticatedUser> {
		const { email, password } = credentials;
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			// future feat: add to telemetry system this failed attempt with email (but not password)
			this.logger.warn('Login attempt failed', {
				event: 'auth.login',
				result: 'failure',
				reason: 'user_not_found',
				email
			});
			throw new InvalidCredentialsError();
		}

		const isValid = await this.passwordService.compare(password, user.passwordHash);
		if (isValid) {
			return AuthenticatedUser.create(user.id, user.email);
		}

		// future feat: add to telemetry system this failed attempt with password (but not email)
		this.logger.warn('Login attempt failed', {
			event: 'auth.login',
			result: 'failure',
			reason: 'invalid_password',
			email
		});
		throw new InvalidCredentialsError();
	}
}
