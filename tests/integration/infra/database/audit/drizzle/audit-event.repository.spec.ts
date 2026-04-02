import {
	setupTestDatabase,
	teardownTestDatabase
} from '@tests/integration/infra/database/audit/setup/audit-test-database';
import { DrizzleAuditEventRepository } from '@/infra/database/audit/drizzle/repositories/audit-event';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Actor } from '@/domain/audit/actor';
import { Subject } from '@/domain/audit/subject';

describe('DrizzleAuditEventRepository (integration)', () => {
	let db;
	let repository: DrizzleAuditEventRepository;

	beforeAll(async () => {
		db = await setupTestDatabase();
		repository = new DrizzleAuditEventRepository(db);
	}, 30000);

	afterAll(async () => {
		await teardownTestDatabase();
	});

	it('should insert an audit event for a user', async () => {
		const auditEvent = {
			name: 'test-event',
			occurredAt: new Date(),
			actor: Actor.user('user-id'),
			subject: Subject.user('subject-id'),
			metadata: {
				key: 'value'
			}
		};

		const call = repository.insert(auditEvent);
		expect(call).resolves.toBeUndefined();
	});
});
