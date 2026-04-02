import type { AuditEvent } from '@/domain/audit/audit-event';
import { Actor } from '@/domain/audit/actor';
import { Subject } from '@/domain/audit/subject';

export class UserLoggedInEvent implements AuditEvent {
	name = 'UserLoggedIn';
	occurredAt = new Date();

	actor: Actor;
	subject: Subject;

	metadata?: Record<string, unknown>;

	private constructor(
		public readonly userId: string,
		metadata?: Record<string, unknown> | undefined
	) {
		this.actor = Actor.user(this.userId);
		this.subject = Subject.user(this.userId);

		if (metadata) {
			this.metadata = metadata;
		}
	}

	static create(userId: string, metadata?: Record<string, unknown>): UserLoggedInEvent {
		return new UserLoggedInEvent(userId, metadata);
	}
}
