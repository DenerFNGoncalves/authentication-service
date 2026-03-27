import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    refreshTokenHash: varchar("refresh_token_hash", { length: 255 }).notNull().unique(),
    userId: uuid("user_id").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 512 }),
    deviceName: varchar("device_name", { length: 255 }),
    lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});