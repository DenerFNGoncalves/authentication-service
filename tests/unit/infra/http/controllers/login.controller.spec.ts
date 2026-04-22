import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { LoginController } from '@/infra/http/controllers/login';
import type { LoginUseCase } from '@/application/use-cases/login';
import { Time } from '@/domain/auth/value-objects/time';
import { ValidationError } from '@/infra/http/errors/validation.error';
import { InvalidCredentialsError } from '@/application/errors/invalid-credentials';

describe('LoginController', () => {
	const makeReq = (body: unknown) => ({ body }) as any;
	const makeRes = () =>
		({
			json: jest.fn()
		}) as any;

	let loginUseCase: jest.Mocked<LoginUseCase>;
	let controller: LoginController;

	beforeEach(() => {
		loginUseCase = {
			execute: jest.fn()
		} as unknown as jest.Mocked<LoginUseCase>;

		controller = new LoginController(loginUseCase);
	});

	it('should validate payload, execute login and return json response', async () => {
		const req = makeReq({
			email: 'user@test.com',
			password: '123456'
		});
		const res = makeRes();

		const response = {
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			expiresIn: Time.minutes(15)
		};

		loginUseCase.execute.mockResolvedValue(response);

		await controller.handle(req, res);

		expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
		const credential = loginUseCase.execute.mock.calls[0]?.[0];
		expect(credential?.email).toBe('user@test.com');
		expect(credential?.password).toBe('123456');
		expect(res.json).toHaveBeenCalledWith(response);
	});

	it('should throw validation error when payload is invalid', async () => {
		const req = makeReq({
			email: 'invalid-email',
			password: '123'
		});
		const res = makeRes();

		await expect(controller.handle(req, res)).rejects.toBeInstanceOf(ValidationError);
		expect(loginUseCase.execute).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});

	it('should propagate use case errors to the error handler layer', async () => {
		const req = makeReq({
			email: 'user@test.com',
			password: '123456'
		});
		const res = makeRes();
		const error = new InvalidCredentialsError();

		loginUseCase.execute.mockRejectedValue(error);

		await expect(controller.handle(req, res)).rejects.toThrow(error);
		expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
		expect(res.json).not.toHaveBeenCalled();
	});
});
