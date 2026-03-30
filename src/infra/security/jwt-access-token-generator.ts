import type { AccessTokens } from '@/application/dtos/session-tokens';
import type { AccessTokenGenerator } from '@/application/ports/access-token-generator';
import { Time, type Minutes } from '@/domain/value-objects/time';

import jwt from 'jsonwebtoken';

export type JWTAccessTokenConfig = {
	accessSecret: string;
	expiresIn: Minutes;
};

export class JwtAccessTokenGenerator implements AccessTokenGenerator {
	constructor(private readonly jwtConfig: JWTAccessTokenConfig) {}

	createAccessToken(userId: string, sessionId: string): AccessTokens {
		const { accessSecret, expiresIn } = this.jwtConfig;

		const accessToken = jwt.sign(
			{
				sub: userId,
				sid: sessionId
			},
			accessSecret,
			{ expiresIn: expiresIn }
		);

		return {
			accessToken: accessToken,
			expiresIn: Time.minutes(expiresIn)
		};
	}
}
