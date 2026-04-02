import type { User } from '@/domain/auth/entities/user';
import type { UserRepository } from '@/domain/auth/repositories/user';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schemas/index';

import { users } from '../schemas/users';
import { eq } from 'drizzle-orm';
import { Email } from '@/domain/auth/value-objects/email';

export class DrizzleUserRepository implements UserRepository {
	constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<User | null> {
		const result = await this.db.select().from(users).where(eq(users.id, id));

		const item = result[0] ?? null;

		if (!item) {
			return null;
		}

		return {
			...item,
			email: Email.create(item.email)
		};
	}

	async findByEmail(email: Email): Promise<User | null> {
		const result = await this.db.select().from(users).where(eq(users.email, email));
		const item = result[0] ?? null;

		if (!item) {
			return null;
		}

		return {
			...item,
			email: Email.create(item.email)
		};
	}
}
