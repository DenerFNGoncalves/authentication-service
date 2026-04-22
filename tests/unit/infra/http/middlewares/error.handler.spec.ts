import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { getErrorHandler } from '@/infra/http/middlewares/error.handler';
import { ValidationError } from '@/infra/http/errors/validation.error';
import type { Logger } from '@/application/ports/logger';

describe('ErrorHandlerMiddleware', () => {
	const makeReq = (overrides: Record<string, unknown> = {}) =>
		({
			method: 'post',
			path: '/api/auth/login',
			query: {},
			body: { email: 'user@test.com' },
			params: {},
			...overrides
		}) as any;

	const makeRes = () => {
		const json = jest.fn();
		const status = jest.fn(() => ({ json }));

		return { status, json } as any;
	};

	const makeNext = () => jest.fn();

	let logger: jest.Mocked<Logger>;
	let errorHandler: ReturnType<typeof getErrorHandler>;

	beforeEach(() => {
		logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn()
		};

		errorHandler = getErrorHandler(logger);
	});

	it('should return app errors with the proper status and payload', () => {
		const req = makeReq();
		const res = makeRes();
		const next = makeNext();
		const error = new ValidationError({
			email: 'Invalid email'
		});

		errorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(error.toJSON());
		expect(logger.error).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it('should return 500 and log unexpected errors', () => {
		const req = makeReq({
			query: { foo: 'bar' },
			params: { id: '123' }
		});
		const res = makeRes();
		const next = makeNext();
		const error = new Error('unexpected');

		errorHandler(error, req, res, next);

		expect(logger.error).toHaveBeenCalledWith('Unexpected error occurred', {
			req: 'POST:/api/auth/login',
			query: { foo: 'bar' },
			body: { email: 'user@test.com' },
			params: { id: '123' },
			err: error
		});
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: 'INTERNAL_ERROR',
			message: 'Unexpected error'
		});
		expect(next).not.toHaveBeenCalled();
	});
});
