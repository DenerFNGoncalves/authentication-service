import type { Request, Response } from 'express';
import type { LoginUseCase } from '@/application/use-cases/login';
import { LoginSchema } from './login.validation';
import { validate } from '@/infra/validation/validation.helper';
import { Credentials } from '@/application/dtos/credential';

export class LoginController {
	constructor(private readonly service: LoginUseCase) {}

	async handle(req: Request, res: Response) {
		const parsed = validate(LoginSchema, req.body);
		const credential = Credentials.create(parsed.email, parsed.password);
		const result = await this.service.execute(credential);

		return res.json(result);
	}
}
