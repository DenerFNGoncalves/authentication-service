export class Session{
    constructor(
        readonly id: string,
        readonly refreshTokenHash: string,
        readonly userId: string,
        readonly ipAddress: string | null,
        readonly userAgent: string | null,
        readonly deviceName: string | null,
        readonly lastUsedAt: Date,
        readonly expiresAt: Date,
        readonly absoluteExpiresAt: Date | null,
        readonly revokedAt: Date | null,
        readonly createdAt: Date,
        readonly updatedAt: Date
    ){}
}