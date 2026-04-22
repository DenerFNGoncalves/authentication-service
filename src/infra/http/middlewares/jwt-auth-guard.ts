import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../types/jwt-payload';
import type { JWSConfig } from '@/infra/config/jws.config';

import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/unauthorized.error';
import type { Logger } from '@/application/ports/logger';

const extractBearer = (req: Request): string => {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		throw new Error('No token provided');
	}

	if (typeof authHeader !== 'string') {
		throw new Error('Invalid token type');
	}

	const [bearer, token] = authHeader.split(' ');
	if (!bearer || !token || bearer.toLowerCase() !== 'bearer') {
		throw new Error('Invalid token format');
	}

	return token;
};

export function getJwtAuthGuardMiddleware(logger: Logger, jwtConfig: JWSConfig) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = extractBearer(req);

			const payload: JwtPayload = jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;

			req.auth = {
				userId: payload.sub,
				sessionId: payload.sid
			};

			return next();
		} catch (err: Error | unknown) {
			logger.error('Error verifying JWT', {
				headers: { token: req.headers['authorization'] || 'Token not provided' },
				err
			});
			return next(new UnauthorizedError(err as Error));
		}
	};
}
