import * as schema from '../schemas/index';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { AuditEventRepository } from '@/application/ports/audit/audit-event.repository';
import type { AuditEvent } from '@/domain/audit/audit-event';
import { auditEvents } from '../schemas/audit-event';

export class DrizzleAuditEventRepository implements AuditEventRepository {
	constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

	async insert(event: AuditEvent): Promise<void> {
		await this.db.insert(auditEvents).values({
			eventName: event.name,
			occurredAt: event.occurredAt,
			actorId: event.actor?.id || null,
			actorType: event.actor?.type || null,
			subjectId: event.subject?.id || null,
			subjectType: event.subject?.type || null,
			context: event.context,
			metadata: event.metadata
		});
	}
}
