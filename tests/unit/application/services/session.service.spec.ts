import { describe, it, expect,beforeEach, jest } from '@jest/globals';
import { SessionService, type SessionServiceConfig } from '@/application/services/session';
import type { PasswordHasher } from '@/application/ports/password-hasher';
import type { Logger } from '@/application/ports/logger';
import type { SessionRepository } from '@/domain/repositories/session';
import type { TokenGenerator } from '@/application/ports/token-generator';
import { DuplicateEntityError } from '@/domain/errors/duplicate-entity-error';
import { SessionCreationError } from '@/application/errors/session-creation-error';

describe('Session Service', () => {
  let logger: jest.Mocked<Logger>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let sessionService: SessionService;
  let userId: string;

  beforeEach(() => {
    userId = "test-user-id";

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    };

    tokenGenerator = {
      generate: jest.fn(),
    } as unknown as jest.Mocked<TokenGenerator>;

    passwordHasher = {
      hash: jest.fn()
    } as unknown as jest.Mocked<PasswordHasher>;
 
    sessionRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<SessionRepository>;

    const configSession: SessionServiceConfig = {
      creationAttempts: 3,
      refreshTokenTtl: "15m",
      absoluteSessionTtl: "30d"
    }

    sessionService = new SessionService(logger, sessionRepository, tokenGenerator, passwordHasher, configSession);  
  });

  it('Should create session', async () => {

    tokenGenerator.generate.mockReturnValue("refresh-token");  
    passwordHasher.hash.mockResolvedValue("hashed-token");

    sessionRepository.create.mockResolvedValue({
      id: "test-session-id",
      refreshTokenHash: "hashed-token",
      userId: userId,
      ipAddress: null,
      userAgent: null,
      deviceName: null,
      absoluteExpiresAt: null,
      lastUsedAt: new Date(),
      expiresAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await sessionService.create(userId);

    expect(tokenGenerator.generate).toHaveBeenCalledWith();
    expect(sessionRepository.create).toHaveBeenCalledWith({
      userId: userId,
      refreshTokenHash: "hashed-token",
      absoluteExpiresAt: expect.any(Date),
      expiresAt: expect.any(Date)
    });
    
    expect(sessionRepository.create).toHaveBeenCalledTimes(1);

    expect(logger.info).toHaveBeenCalledWith('Session created', {
      userId,
      sessionId: "test-session-id",
      expiresAt: expect.any(Date),
      event: "auth.session.create",
      result: "success"
    });

    expect(result).toEqual({
      sessionId: "test-session-id",
      expiresAt: expect.any(Date),
      refreshToken: "refresh-token",
    });
  }); 

  it('should retry session creation when duplicate error occurs', async () => {
    tokenGenerator.generate.mockReturnValue('refresh-token');
    passwordHasher.hash.mockResolvedValue('hashed-token');

    sessionRepository.create
        .mockRejectedValueOnce(new DuplicateEntityError('Session'))
        .mockResolvedValueOnce({
          id: "test-session-id",
          refreshTokenHash: "hashed-token",
          userId: userId,
          ipAddress: null,
          userAgent: null,
          deviceName: null,
          absoluteExpiresAt: null,
          lastUsedAt: new Date(),
          expiresAt: new Date(),
          revokedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });

      const result = await sessionService.create(userId);

      expect(result.sessionId).toBe('test-session-id');
      expect(logger.info).toHaveBeenNthCalledWith(1, 'Attempting to create session', {
        userId,
        attempt: 1,
        event: "auth.session.create",
        stage: "attempt"
      });

      expect(sessionRepository.create).toHaveBeenCalledTimes(2);

      expect(logger.warn).toHaveBeenNthCalledWith(1, 'Duplicate session detected, retrying session creation', {
        userId,
        attempt: 1,
        event: "auth.session.create",
        result: "failure",
        reason: "duplicate_session"
      });

      expect(logger.info).toHaveBeenNthCalledWith(2, 'Attempting to create session', {
        userId,
        attempt: 2,
        event: "auth.session.create",
        stage: "attempt"
      });
  });
  
  it('should throw SessionCreationError on unexpected error', async () => {
    tokenGenerator.generate.mockReturnValue('refresh-token');
    passwordHasher.hash.mockResolvedValue('hashed-token');

    sessionRepository.create.mockRejectedValue(new Error('db down'));

    await expect(sessionService.create(userId))
      .rejects
      .toBeInstanceOf(SessionCreationError);

    expect(logger.error).toHaveBeenCalledWith('Unexpected error during session creation', {
      userId,
      attempt: 1,
      event: "auth.session.create",
      result: "failure",
      err: expect.any(Error)
    });

  });

  it('should throw SessionCreationError after max retry attempts', async () => {
    tokenGenerator.generate.mockReturnValue('refresh-token');
    passwordHasher.hash.mockResolvedValue('hashed-token');

    sessionRepository.create.mockRejectedValue(
      new DuplicateEntityError('Session')
    );

    await expect(sessionService.create(userId))
      .rejects
      .toBeInstanceOf(SessionCreationError);

    expect(sessionRepository.create).toHaveBeenCalledTimes(3);

    expect(logger.error).toHaveBeenCalledWith('Failed to create session after maximum attempts', {
      userId,
      attempt: 4,
      event: "auth.session.create",
      result: "failure",
      reason: "max_attempts_reached",
      err: expect.any(Error)
    });
  });

});
