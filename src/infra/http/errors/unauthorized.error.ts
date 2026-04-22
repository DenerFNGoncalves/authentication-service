import { AppError } from './app.error';

export class UnauthorizedError extends AppError {
	constructor(error: Error, code = 'UNAUTHORIZED') {
		super(error.message, 401, code);
		this.name = error.name || 'UnauthorizedError';
	}
}
