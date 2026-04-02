export class PersistenceError extends Error {
	constructor(protected readonly entityName: string) {
		super(`Failed to create ${entityName}`);
		this.name = 'PersistenceError';
	}
}
