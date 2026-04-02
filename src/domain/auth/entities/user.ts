import type { Email } from '../value-objects/email';

export class User {
	constructor(
		readonly id: string,
		readonly email: Email,
		readonly username: string,
		readonly passwordHash: string,
		readonly createdAt: Date,
		readonly updatedAt: Date
	) {}
}
