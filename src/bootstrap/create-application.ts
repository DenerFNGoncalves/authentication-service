import { config } from '@/infra/config';

import { createAuthDb } from '@/infra/database/auth/drizzle/client';
import { DrizzleUserRepository } from '@/infra/database/auth/drizzle/repositories/user';
import { DrizzleSessionRepository } from '@/infra/database/auth/drizzle/repositories/session';

import { createAuditDb } from '@/infra/database/audit/drizzle/client';
import { DrizzleAuditEventRepository } from '@/infra/database/audit/drizzle/repositories/audit-event';

import { LoginUseCase } from '@/application/use-cases/login';
import { LoginService } from '@/application/services/login';
import { SessionService } from '@/application/services/session';

import { BcryptPasswordHasher } from '@/infra/security/bcrypt-password-hasher';
import { JwtAccessTokenGenerator } from '@/infra/security/jwt-access-token-generator';
import { CryptoTokenGenerator } from '@/infra/security/crypto-token-generator';

import { PinoLogger } from '@/infra/observability/logger/pino-logger';
import { LoginController } from '@/infra/http/controllers/login';

export function createApplication() {
	const logger = new PinoLogger(config.logger);

	const authDB = createAuthDb(config.authDb);

	const userRepository = new DrizzleUserRepository(authDB);
	const sessionRepository = new DrizzleSessionRepository(logger, authDB);

	const auditDB = createAuditDb(config.auditDb);
	const auditEventRepository = new DrizzleAuditEventRepository(auditDB);

	const passwordHasher = new BcryptPasswordHasher();

	const tokenGenerator = new CryptoTokenGenerator();

	const accessTokenGenerator = new JwtAccessTokenGenerator({
		accessSecret: config.jws.accessSecret,
		expiresIn: config.session.accessTokenTtl
	});

	const sessionService = new SessionService(
		logger,
		sessionRepository,
		tokenGenerator,
		passwordHasher,
		{
			creationAttempts: config.session.creationAttempts,
			refreshTokenTtl: config.session.refreshTokenTtl,
			absoluteSessionTtl: config.session.absoluteSessionTtl
		}
	);

	const loginService = new LoginService(logger, userRepository, passwordHasher);

	const loginUseCase = new LoginUseCase(logger, loginService, sessionService, accessTokenGenerator);

	const loginController = new LoginController(loginUseCase);

	return {
		logger,
		controllers: {
			loginController
		}
	};
}
