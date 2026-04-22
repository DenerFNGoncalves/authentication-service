import type { Request, Response } from 'express';
import type { LoginUseCase } from '@/application/use-cases/login';
import { LoginSchema } from './login.validation';
import { validate } from '@/infra/validation/validation.helper';
import { Credentials } from '@/application/dtos/credential';
import { InvalidCredentialsError } from '@/application/errors/invalid-credentials';
import { UnauthorizedError } from '../errors/unauthorized.error';

export class LoginController {
	constructor(private readonly service: LoginUseCase) {}

	async handle(req: Request, res: Response) {
		const parsed = validate(LoginSchema, req.body);
		const credential = Credentials.create(parsed.email, parsed.password);

		const result = await this.service.execute(credential).catch((err) => {
			if (err instanceof InvalidCredentialsError) {
				throw new UnauthorizedError(err, 'INVALID_CREDENTIALS');
			}
			throw err;
		});

		return res.json(result);
	}
}
