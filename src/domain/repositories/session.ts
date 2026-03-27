import type { Session } from "../entities/session.js";

export interface CreateSessionInput {
  userId: string
  refreshTokenHash: string
  expiresAt: Date
  absoluteExpiresAt: Date | null
}

export interface SessionRepository {
    create(data: CreateSessionInput):
        Promise<Session>;
}