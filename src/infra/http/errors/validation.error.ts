import { AppError } from './app.error';

export class ValidationError extends AppError {
	constructor(public readonly fields: Record<string, string>) {
		super('Invalid fields', 400, 'VALIDATION_ERROR');
		this.name = 'ValidationError';
	}

	override toJSON() {
		return {
			error: this.code,
			message: this.message,
			fields: this.fields
		};
	}
}
