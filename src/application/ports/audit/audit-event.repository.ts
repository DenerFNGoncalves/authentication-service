import type { AuditEvent } from '@/domain/audit/audit-event';

export interface AuditEventRepository {
	insert(auditEvent: AuditEvent): Promise<void>;
}
