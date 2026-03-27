export interface AccessTokenGenerator {
    createAccessToken(userId: string, sessionId: string): string;
}