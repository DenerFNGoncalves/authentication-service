import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Session } from "@/domain/entities/session";
import type { SessionRepository } from "@/domain/repositories/session";

import { sessions } from "../schemas/sessions";
import { PersistenceError } from "@/domain/errors/persistence-error";
import { DuplicateEntityError } from "@/domain/errors/duplicate-entity-error";
import * as schema from "@/infra/db/drizzle/schemas/index";
import type { Logger } from "@/application/ports/logger";

export class DrizzleSessionRepository implements SessionRepository {
    constructor(
        private readonly logger: Logger,
        private readonly db: PostgresJsDatabase<typeof schema>
    ) {}

    async create(data: { userId: string; refreshTokenHash: string; expiresAt: Date; })
        : Promise<Session> {

        let result: any[];
        try {
            result = await this.db.insert(sessions).values({
                userId: data.userId,
                refreshTokenHash: data.refreshTokenHash,
                expiresAt: data.expiresAt,
                }).returning();
        } catch (error) {
            if (this.isPgUniqueViolation(error)) {
                this.logger.warn('Database unique constraint violation on session creation', {
                    userId: data.userId,
                    err: error
                });
                throw new DuplicateEntityError("Session");
            }
            
            this.logger.error('Error creating session', {   
                userId: data.userId,
                err: error
            });
            throw new PersistenceError("Session");
        }

        return result[0] as Session;
    }

    private isPgUniqueViolation(error: any): boolean {
        return error?.cause?.code === '23505';
    }
}