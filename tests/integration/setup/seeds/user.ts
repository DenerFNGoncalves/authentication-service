import { users } from "@/infra/db/drizzle/schemas/users";
import * as schema from "@/infra/db/drizzle/schemas/index";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";


export const idsUserTest: string[] = ['053e058d-00db-4760-9244-f67d60fc387e'];

export async function seedUsers(db: PostgresJsDatabase<typeof schema>) {
  await db.insert(users).values([
    {
        id: idsUserTest[0],
        username: "Test User",
        email: "test@mail.com",
        active: true,
        passwordHash: "hashed"
    },
  ]);
}