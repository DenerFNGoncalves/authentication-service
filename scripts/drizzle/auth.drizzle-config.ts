import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/infra/database/auth/drizzle/schemas/index.ts',
	out: './src/infra/database/auth/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_AUTH_URL || 'postgresql://user:password@localhost:5432/auth_db'
	}
});
