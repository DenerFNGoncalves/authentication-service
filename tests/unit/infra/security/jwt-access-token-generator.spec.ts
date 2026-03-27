import type { StringValue } from "ms";
import { describe, it, expect, beforeAll } from '@jest/globals';
import { JwtAccessTokenGenerator } from "@/infra/security/jwt-access-token-generator";
import { verify as jwtVerifyToken} from "jsonwebtoken";

describe('JwtAccessTokenGenerator', () => {
    let jwtConfig: { accessSecret: string; expiresIn: StringValue };
    let jwtGenerator: JwtAccessTokenGenerator;

    beforeAll(() => {
        jwtConfig = {
            accessSecret: 'test-secret',
            expiresIn: '1h'
        } as { accessSecret: string; expiresIn: StringValue };

        jwtGenerator = new JwtAccessTokenGenerator(jwtConfig);
    });

    it('should create a valid JWT access token', () => {
        const userId = 'test-user-id';
        const sessionId = 'test-session-id';

        const token = jwtGenerator.createAccessToken(userId, sessionId);

        expect(typeof token).toBe('string');
        const decoded = jwtVerifyToken(token, jwtConfig.accessSecret) as { sub: string; sid: string; };

        expect(decoded.sub).toBe(userId);
        expect(decoded.sid).toBe(sessionId);
    });

    
});
