
import { config } from '@/infra/config'

import { createDrizzleDb } from '@/infra/db/drizzle/client';
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user';
import { DrizzleSessionRepository } from '@/infra/db/drizzle/repositories/session';

import { LoginUseCase } from '@/application/use-cases/login';
import { LoginService } from '@/application/services/login';
import { SessionService } from '@/application/services/session';

import { BcryptPasswordHasher } from '@/infra/security/bcrypt-password-hasher';
import { JwtAccessTokenGenerator } from '@/infra/security/jwt-access-token-generator';
import { CryptoTokenGenerator } from '@/infra/security/crypto-token-generator';

import { PinoLogger } from '@/infra/observability/logger/pino-logger';

export function createApplication() {

  const logger = new PinoLogger(config.logger);

  const db = createDrizzleDb();

  const userRepository =
    new DrizzleUserRepository(db);

  const sessionRepository =
    new DrizzleSessionRepository(logger, db);

  const passwordHasher =
    new BcryptPasswordHasher();

  const tokenGenerator =
    new CryptoTokenGenerator();

  const accessTokenGenerator =
    new JwtAccessTokenGenerator({
      accessSecret: config.jws.accessSecret,
      expiresIn: config.session.accessTokenTtl
    });

  const sessionService =
    new SessionService(
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

  const loginService =
    new LoginService(
      logger,
      userRepository,
      passwordHasher
    );

  const loginUseCase =
    new LoginUseCase(
      logger,
      loginService,
      sessionService,
      accessTokenGenerator
    );

  return {
    logger,
    useCases: {
      loginUseCase
    }
  };
}