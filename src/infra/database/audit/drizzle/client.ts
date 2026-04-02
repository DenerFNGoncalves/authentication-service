import type { DatabaseConfig } from '@/infra/config/database.config';
import { createDrizzleDb } from '@/infra/database/helper/drizzle/create-client';
import * as schema from './schemas/index';

export const createAuditDb = (dbConfig: DatabaseConfig) => {
	return createDrizzleDb(dbConfig, schema);
};
