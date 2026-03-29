import { type RequestContext, requestContext } from './request-context';

export function getRequestInfo(): RequestContext | undefined {
	const store = requestContext.getStore();
	if (!store) {
		return undefined;
	}

	return {
		requestId: store.requestId,
		userId: store.userId || undefined,
		ipAddress: store.ipAddress || undefined
	};
}
