import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas/index";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL 
    || "postgresql://user:password@localhost:5432/auth_db";

const client = postgres(connectionString);

export const createDrizzleDb = (): PostgresJsDatabase<typeof schema> => drizzle(client, { schema });
