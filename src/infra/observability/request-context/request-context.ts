import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
	requestId: string;
	userId?: string | undefined;
	ipAddress?: string | undefined;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();
