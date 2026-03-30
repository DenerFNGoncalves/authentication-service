export abstract class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly code: string
	) {
		super(message);
		this.name = this.constructor.name;
	}

	toJSON() {
		return {
			error: this.code,
			message: this.message
		};
	}
}
