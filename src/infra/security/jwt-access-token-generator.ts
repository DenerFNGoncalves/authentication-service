import type { AccessTokenGenerator } from "@/application/ports/access-token-generator";
import type { StringValue } from "ms";

import jwt from "jsonwebtoken";

export interface JWTAccessTokenConfig {
    accessSecret: string;
    expiresIn: StringValue;
}

export class JwtAccessTokenGenerator implements AccessTokenGenerator {
    
    constructor(private readonly jwtConfig: JWTAccessTokenConfig) {}

    createAccessToken(userId: string, sessionId: string): string {
          const accessToken = jwt.sign({
                sub: userId,
                sid: sessionId
            },
            this.jwtConfig.accessSecret,
            {  expiresIn: this.jwtConfig.expiresIn }
        );

        return accessToken;
    }
}