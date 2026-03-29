export class SessionCreationError extends Error {
	constructor() {
		super('Failed to create session.');
		this.name = 'SessionCreationError';
	}
}
