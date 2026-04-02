import type { Request, Response, NextFunction } from 'express';
import type { RequestContext } from '@/infra/observability/request-context/request-context';
import { randomUUID } from 'node:crypto';
import { requestContext } from '@/infra/observability/request-context/request-context';

function getClientIp(req: Request): string | undefined {
	const forwarded = req.headers['x-forwarded-for'];

	if (!forwarded) {
		return req.ip;
	}

	if (typeof forwarded === 'string') {
		const ip = forwarded.split(',')[0]?.trim();
		return ip || req.ip;
	}

	if (Array.isArray(forwarded)) {
		// múltiplos headers
		const ip = forwarded[0]?.split(',')[0]?.trim();
		return ip || req.ip;
	}

	return req.ip;
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
	const requestId = req.headers['x-request-id'] || randomUUID();
	const ipAddress = getClientIp(req);
	const userAgent =
		typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;

	const context: RequestContext = {
		requestId: typeof requestId === 'string' ? requestId : String(requestId),
		ipAddress,
		userAgent
	};

	res.setHeader('X-Request-Id', requestId);
	requestContext.run(context, () => next());
}
