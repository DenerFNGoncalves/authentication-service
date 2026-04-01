import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/infra/database/audit/drizzle/schemas/index.ts',
	out: './src/infra/database/audit/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_AUDIT_URL || 'postgresql://user:password@localhost:5432/audit_db'
	}
});
