import express, { type NextFunction, type Request, type Response } from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { LoginController } from '@/infra/http/controllers/login';
import type { LoginUseCase } from '@/application/use-cases/login';
import { createAuthRoutes } from '@/infra/http/routes/auth';
import { requestContextMiddleware } from '@/infra/http/middlewares/request-context';
import { getErrorHandler } from '@/infra/http/middlewares/error.handler';
import type { Logger } from '@/application/ports/logger';
import { Time } from '@/domain/auth/value-objects/time';
import { sendHttpRequest } from '@tests/e2e/infra/http/setup/http-server';

describe('Login Route (integration)', () => {
	let logger: jest.Mocked<Logger>;
	let loginUseCase: jest.Mocked<LoginUseCase>;

	beforeEach(() => {
		logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn()
		};

		loginUseCase = {
			execute: jest.fn()
		} as unknown as jest.Mocked<LoginUseCase>;
	});

	function createTestApp() {
		const app = express();
		const loginController = new LoginController(loginUseCase);
		const allowRequest = (_req: Request, _res: Response, next: NextFunction) => next();

		app.use(express.json());
		app.use(requestContextMiddleware);
		app.use(
			'/api/auth',
			createAuthRoutes(allowRequest, {
				loginController
			})
		);
		app.use(getErrorHandler(logger));

		return app;
	}

	it('should return 200 and tokens on a successful request', async () => {
		loginUseCase.execute.mockResolvedValue({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			expiresIn: Time.minutes(15)
		});

		const response = await sendHttpRequest(createTestApp(), {
			path: '/api/auth/login',
			body: {
				email: 'user@test.com',
				password: '123456'
			}
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			expiresIn: 15
		});
		expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
		expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
	});

	it('should return 400 when request payload is invalid', async () => {
		const response = await sendHttpRequest(createTestApp(), {
			path: '/api/auth/login',
			body: {
				email: 'invalid-email',
				password: '123'
			}
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			error: 'VALIDATION_ERROR',
			message: 'Invalid fields',
			fields: expect.objectContaining({
				email: expect.any(String),
				password: expect.any(String)
			})
		});
		expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
		expect(loginUseCase.execute).not.toHaveBeenCalled();
	});

	it('should return 500 and finalize the request when an unexpected error happens', async () => {
		const error = new Error('unexpected');
		loginUseCase.execute.mockRejectedValue(error);

		const response = await sendHttpRequest(createTestApp(), {
			path: '/api/auth/login',
			body: {
				email: 'user@test.com',
				password: '123456'
			}
		});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({
			error: 'INTERNAL_ERROR',
			message: 'Unexpected error'
		});
		expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
		expect(logger.error).toHaveBeenCalledWith(
			'Unexpected error occurred',
			expect.objectContaining({
				req: 'POST:/api/auth/login',
				err: error
			})
		);
	});
});
