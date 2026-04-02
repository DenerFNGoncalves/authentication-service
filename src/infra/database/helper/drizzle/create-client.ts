import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { DatabaseConfig } from '@/infra/config/database.config';

export const createDrizzleDb = (
	dbConfig: DatabaseConfig,
	schema: any
): PostgresJsDatabase<typeof schema> => {
	const client = postgres(dbConfig.url);
	return drizzle(client, { schema });
};
