import { setupTestDatabase, teardownTestDatabase } from '@tests/integration/setup/test-database';
import { DrizzleSessionRepository } from '@/infra/db/drizzle/repositories/session';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { idsUserTest } from '@tests/integration/setup/seeds/user';
import type { Logger } from '@/application/ports/logger';
import { DuplicateEntityError } from '@/domain/errors/duplicate-entity-error';
import { PersistenceError } from '@/domain/errors/persistence-error';

describe('DrizzleSessionRepository (integration)', () => {
  let db;
  let repository: DrizzleSessionRepository;
  
  let logger: jest.Mocked<Logger>;

  beforeAll(async () => {
    db = await setupTestDatabase();

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    };
    repository = new DrizzleSessionRepository(logger, db);
  }, 30000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create a session for a user', async () => {
    const id = idsUserTest[0] || 'str';
    `test-refresh-token-${Date.now()}`
    const refreshTokenHash = `test-refresh-token-${Date.now()}`;

    const userData = { 
        userId: id,
        refreshTokenHash,
        expiresAt: new Date()
    };
    
    const session = await repository.create(userData);
    expect(session).not.toBeNull();
  });

  it('should throw DuplicateEntityError when creating a session with duplicate refreshTokenHash', async () => {
    const id = idsUserTest[0] || 'str';
    const refreshTokenHash = `duplicate-token-${Date.now()}`;
    const userData = { 
        userId: id,
        refreshTokenHash,
        expiresAt: new Date()
    };  

    await repository.create(userData);

    await expect(repository.create({
      ...userData,
      expiresAt: new Date()
    })).rejects.toBeInstanceOf(DuplicateEntityError);

    expect(logger.warn).toHaveBeenCalledWith('Database unique constraint violation on session creation', {
        userId: userData.userId,
        err: expect.any(Error),
    });
  });

  it('should throw PersistenceError when creating a session with invalid data', async () => {
    const id = idsUserTest[0] || 'str'; 

    const refreshTokenHash = `duplicate-token-${Date.now()}`;
    const userData = {
      userId: 'invalid-id',
      refreshTokenHash,
      expiresAt: new Date()
    };

    await expect(repository.create( 
       userData)).rejects.toBeInstanceOf(PersistenceError);

    expect(logger.error).toHaveBeenCalledWith('Error creating session', {
        userId: userData.userId,
        err: expect.any(Error),
    });
  });
  
});
