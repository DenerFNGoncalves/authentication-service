import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import { seedUsers } from './seeds/user';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '@/infra/database/auth/drizzle/schemas/index';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

let container: any;
let client: postgres.Sql<{}>;
let db: PostgresJsDatabase<typeof schema>;

export async function setupTestDatabase() {
	container = await new PostgreSqlContainer('postgres:13-alpine')
		.withDatabase('test_authdb')
		.withUsername('test')
		.withPassword('test')
		.start();

	const connectionString = container.getConnectionUri();
	client = postgres(connectionString);

	db = drizzle(client, { schema });

	await migrate(db, {
		migrationsFolder: './src/infra/database/auth/drizzle/migrations'
	});

	await seedUsers(db);

	return db;
}

export async function teardownTestDatabase() {
	if (client) {
		await client.end();
	}

	if (container) {
		await container.stop();
	}
}
