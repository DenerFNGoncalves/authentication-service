import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { sendHttpRequest } from '@tests/e2e/infra/http/setup/http-server';
import { createTestApp } from './setup/create-app-test';
import type { PasswordHasher } from '@/application/ports/password-hasher';

describe('Login HTTP (e2e)', () => {
	beforeEach(() => {
		process.env.NODE_ENV = 'test';
		process.env.PORT = '3001';
		process.env.JWT_ACCESS_SECRET = 'test-secret';
		process.env.SESSION_CREATION_ATTEMPTS = '3';
		process.env.ACCESS_TOKEN_TTL = '15';
		process.env.REFRESH_TOKEN_TTL = '7';
	});

	// This test covers the full login flow, from receiving the HTTP request to returning the response,
	// including interaction with the application layer and the repositories.
	it('should complete the full login request successfully', async () => {
		const server = await createTestApp();
		const response = await sendHttpRequest(server.app, {
			path: '/api/auth/login',
			body: {
				email: 'user@test.com',
				password: '123456'
			}
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			accessToken: 'access-user-123-session-123',
			refreshToken: 'refresh-token',
			expiresIn: 15
		});
		expect(server.db.sessions).toHaveLength(1);
		expect(server.mocks.auditEventService.record).toHaveBeenCalledTimes(2);
	});

	// This test ensures that even if the audit service is unavailable,
	// the login request can still complete successfully.
	it('should complete the request even when audit recording fails', async () => {
		const auditError = new Error('audit unavailable');
		const server = await createTestApp();

		server.mocks.auditEventService.record.mockRejectedValue(auditError);

		const response = await sendHttpRequest(server.app, {
			path: '/api/auth/login',
			body: {
				email: 'user@test.com',
				password: '123456'
			}
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			accessToken: 'access-user-123-session-123',
			refreshToken: 'refresh-token',
			expiresIn: 15
		});
		expect(server.db.sessions).toHaveLength(1);
		expect(server.mocks.logger.error).toHaveBeenNthCalledWith(
			1,
			'Failed to record UserLoggedInEvent',
			{
				event: 'audit.record',
				err: auditError
			}
		);
		expect(server.mocks.logger.error).toHaveBeenNthCalledWith(
			2,
			'Failed to record SessionCreatedEvent',
			{
				event: 'audit.record',
				err: auditError
			}
		);
	});

	// This test ensures that if the credentials are invalid, the controller returns
	// a 401 response with the correct error message,
	it('should return 401 when credentials are invalid', async () => {
		const server = await createTestApp();
		const response = await sendHttpRequest(server.app, {
			path: '/api/auth/login',
			body: {
				email: 'user@test.com',
				password: 'wrong-password'
			}
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({
			error: 'INVALID_CREDENTIALS',
			message: 'Invalid credentials'
		});
		expect(server.db.sessions).toHaveLength(0);
		expect(server.mocks.auditEventService.record).not.toHaveBeenCalled();
	});

	// This test simulates an unexpected error during the login process (e.g., database connection failure)
	// and verifies that the controller returns a 500 response with a generic error message,
	// and that the error is logged properly.
	it('should return 500 when an unexpected error happens during login', async () => {
		const passwordHasher: PasswordHasher = {
			hash: async (plain) => `hashed:${plain}`,
			compare: async () => {
				throw new Error('password provider unavailable');
			}
		};

		const server = await createTestApp({
			passwordHasher
		});

		const response = await sendHttpRequest(server.app, {
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
		expect(server.db.sessions).toHaveLength(0);
		expect(server.mocks.auditEventService.record).not.toHaveBeenCalled();
		expect(server.mocks.logger.error).toHaveBeenCalledWith(
			'Unexpected error occurred',
			expect.objectContaining({
				req: 'POST:/api/auth/login',
				err: expect.any(Error)
			})
		);
	});
});
