import type { AuditEvent } from '@/domain/audit/audit-event';
import type { AuditEventRepository } from '@/application/ports/audit/audit-event.repository';
import type { Logger } from '@/application/ports/logger';
import type { AuditEventService } from '@/application/ports/audit/audit-event.service';
import { getRequestInfo } from '../request-context/utils';

export class AuditEventServiceImpl implements AuditEventService {
	constructor(private readonly auditEventRepository: AuditEventRepository) {}

	async record(event: AuditEvent): Promise<void> {
		const context = getRequestInfo();

		if (context) {
			const { requestId, ipAddress, userAgent } = context;
			event.context = {
				...(requestId && { requestId }),
				...(ipAddress && { ipAddress }),
				...(userAgent && { userAgent }),
			};
		}

		await this.auditEventRepository.insert(event);
	}
}
