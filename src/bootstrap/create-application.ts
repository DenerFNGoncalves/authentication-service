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
import { AuditEventServiceImpl } from '@/infra/observability/audit/audit-event.service';
import type { Logger } from '@/application/ports/logger';
import type { UserRepository } from '@/domain/auth/repositories/user';
import type { SessionRepository } from '@/domain/auth/repositories/session';
import type { PasswordHasher } from '@/application/ports/password-hasher';
import type { TokenGenerator } from '@/application/ports/token-generator';
import type { AccessTokenGenerator } from '@/application/ports/access-token-generator';
import type { AuditEventService } from '@/application/ports/audit/audit-event.service';

export type ApplicationControllers = {
	loginController: LoginController;
};

export type CreateApplicationOverrides = {
	logger?: Logger;
	userRepository?: UserRepository;
	sessionRepository?: SessionRepository;
	passwordHasher?: PasswordHasher;
	tokenGenerator?: TokenGenerator;
	accessTokenGenerator?: AccessTokenGenerator;
	auditEventService?: AuditEventService;
	loginController?: LoginController;
};

export type ApplicationInstance = {
	logger: Logger;
	controllers: ApplicationControllers;
};

export function createApplication(overrides: CreateApplicationOverrides = {}): ApplicationInstance {
	const logger = overrides.logger ?? new PinoLogger(config.logger);

	const authDB = createAuthDb(config.authDb);

	const userRepository = overrides.userRepository ?? new DrizzleUserRepository(authDB);
	const sessionRepository =
		overrides.sessionRepository ?? new DrizzleSessionRepository(logger, authDB);

	const auditDB = createAuditDb(config.auditDb);
	const auditEventRepository = new DrizzleAuditEventRepository(auditDB);
	const auditEventService =
		overrides.auditEventService ?? new AuditEventServiceImpl(auditEventRepository);

	const passwordHasher = overrides.passwordHasher ?? new BcryptPasswordHasher();

	const tokenGenerator = overrides.tokenGenerator ?? new CryptoTokenGenerator();

	const accessTokenGenerator =
		overrides.accessTokenGenerator ??
		new JwtAccessTokenGenerator({
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

	const loginUseCase = new LoginUseCase(
		logger,
		loginService,
		sessionService,
		accessTokenGenerator,
		auditEventService
	);

	const loginController = overrides.loginController ?? new LoginController(loginUseCase);

	return {
		logger,
		controllers: {
			loginController
		}
	};
}
