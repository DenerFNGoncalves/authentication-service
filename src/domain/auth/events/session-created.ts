import type { AuditEvent } from '@/domain/audit/audit-event';
import { Actor } from '@/domain/audit/actor';
import { Subject } from '@/domain/audit/subject';

export class SessionCreatedEvent implements AuditEvent {
	name = 'SessionCreated';
	occurredAt = new Date();

	actor: Actor;
	subject: Subject;

	metadata?: Record<string, unknown>;

	private constructor(
		public readonly userId: string,
		public readonly sessionId: string,
		metadata?: Record<string, unknown> | undefined
	) {
		this.actor = Actor.user(this.userId);
		this.subject = Subject.session(this.sessionId);

		if (metadata) {
			this.metadata = metadata;
		}
	}

	static create(
		userId: string,
		sessionId: string,
		metadata?: Record<string, unknown>
	): SessionCreatedEvent {
		return new SessionCreatedEvent(userId, sessionId, metadata);
	}
}
