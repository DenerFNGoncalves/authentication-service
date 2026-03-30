import { AppError } from './app.error';

export class UnexpectedError extends AppError {
	constructor() {
		super('Unexpected error', 500, 'INTERNAL_ERROR');
		this.name = 'UnexpectedError';
	}
}
