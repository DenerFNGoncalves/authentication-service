import type { AuditEvent } from '@/domain/audit/audit-event';

export interface AuditEventService {
	record(event: AuditEvent): Promise<void>;
}
