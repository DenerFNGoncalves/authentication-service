import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/infra/db/drizzle/schemas/index.ts',
	out: './src/infra/db/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/auth_db'
	}
});
