import { type RequestContext, requestContext } from './request-context';

export function getRequestInfo(): RequestContext | undefined {
	const store = requestContext.getStore();
	return store || undefined;
}
