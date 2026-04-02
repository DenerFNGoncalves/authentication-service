import {
	setupTestDatabase,
	teardownTestDatabase
} from '@tests/integration/infra/database/auth/setup/auth-test-database';
import { DrizzleUserRepository } from '@/infra/database/auth/drizzle/repositories/user';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { idsUserTest } from '@tests/integration/infra/database/auth/setup/seeds/user';
import { Email } from '@/domain/auth/value-objects/email';

describe('DrizzleUserRepository (integration)', () => {
	let db;
	let repository: DrizzleUserRepository;

	beforeAll(async () => {
		db = await setupTestDatabase();
		repository = new DrizzleUserRepository(db);
	}, 30000);

	afterAll(async () => {
		await teardownTestDatabase();
	});

	it('should find a user by id', async () => {
		const id = idsUserTest[0] || 'str';
		const user = await repository.findById(id);

		expect(user).not.toBeNull();
		expect(user?.username).toBe('Test User');
	});

	it('should find a user by email', async () => {
		const email = Email.create('test@mail.com');
		const user = await repository.findByEmail(email);

		expect(user).not.toBeNull();
		expect(user?.email).toBe(email);
	});
});
