import type { Logger } from '../ports/logger';

export class LogoutUseCase {
	constructor(private readonly logger: Logger) {}

	async execute(): Promise<any> {
		return null;
	}
}
