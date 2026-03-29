import type { User } from '@/domain/entities/user';
import type { UserRepository } from '@/domain/repositories/user';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/infra/db/drizzle/schemas/index';

import { users } from '../schemas/users';
import { eq } from 'drizzle-orm';

export class DrizzleUserRepository implements UserRepository {
	constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

	async findById(id: string): Promise<User | null> {
		const result = await this.db.select().from(users).where(eq(users.id, id));
		return result[0] ?? null;
	}

	incrementTokenVersion(userId: string): Promise<void> {
		throw new Error('Method not implemented.');
	}

	async findByEmail(email: string) {
		const result = await this.db.select().from(users).where(eq(users.email, email));
		return result[0] ?? null;
	}
}
