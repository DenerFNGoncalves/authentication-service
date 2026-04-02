import { Actor } from './actor.js';
import { Subject } from './subject.js';

export interface AuditEvent {
	name: string;

	occurredAt: Date;

	actor?: Actor;

	subject?: Subject;

	metadata?: Record<string, unknown>;
}
