import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const auditEvents = pgTable('audit_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	eventName: varchar('event_name', { length: 100 }).notNull(),
	actorId: varchar('actor_id', { length: 255 }),
	actorType: varchar('actor_type', { length: 50 }),
	subjectId: varchar('subject_id', { length: 255 }),
	subjectType: varchar('subject_type', { length: 50 }),
	occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
	context: jsonb('context'),
	metadata: jsonb('metadata')
});
