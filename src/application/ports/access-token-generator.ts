import type { AccessTokens } from '../dtos/session-tokens';

export interface AccessTokenGenerator {
	createAccessToken(userId: string, sessionId: string): AccessTokens;
}
