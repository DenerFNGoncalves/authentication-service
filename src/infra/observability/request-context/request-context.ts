import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
	requestId?: string | undefined;
	userId?: string | undefined;
	ipAddress?: string | undefined;
	userAgent?: string | undefined;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();
