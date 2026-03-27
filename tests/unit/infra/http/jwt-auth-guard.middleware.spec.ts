import {describe, it, expect, beforeEach, jest } from '@jest/globals'; 

import jwt from 'jsonwebtoken';
import type { JWSConfig } from '@/infra/config/jws.config';
import { getJwtAuthGuardMiddleware } from "@/infra/http/middlewares/jwt-auth-guard"
import { UnauthorizedError } from '@/infra/http/errors/unauthorized';
import type { Logger } from '@/application/ports/logger';

describe('JwtAuthGuardMiddleware', () => {
    const makeReq = (headers: any = {}) => ({ headers } as any);
    const makeRes = () => ({} as any);
    const makeNext = () => jest.fn();

    let jwtConfig: JWSConfig;
    let logger: jest.Mocked<Logger>;
    let authMiddleware: ReturnType<typeof getJwtAuthGuardMiddleware>;
    
    beforeEach(() => {
        jwtConfig = {
            accessSecret: 'test-secret'
        };
        
        logger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            fatal: jest.fn(),
        };

        authMiddleware = getJwtAuthGuardMiddleware(logger, jwtConfig);
    });

    it('should set auth in the req', async () => {
         const token = jwt.sign(
            { sub: 'test-user-id', sid: 'test-session-id' },
            jwtConfig.accessSecret
        );

        const req = makeReq({ authorization: `Bearer ${token}` });
        const res = makeRes();
        const next = makeNext();

        authMiddleware(req, res, next);

        expect(req.auth).toEqual({
            userId: 'test-user-id',
            sessionId: 'test-session-id'
        });
        expect(next).toHaveBeenCalledWith();
    });

    it('should return with UnauthorizedError when header is missing', () => {
        const req = makeReq();
        const res = makeRes();
        const next = makeNext();

        authMiddleware(req, res, next);

        expect(logger.error).toHaveBeenCalledWith('Error verifying JWT', 
            expect.objectContaining({
                err: expect.any(Error),
            })
        );

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should return with UnauthorizedError when token is invalid', () => {
        const req = makeReq({
            authorization: 'Bearer invalid.token'
        });
        const res = makeRes();
        const next = makeNext();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(logger.error).toHaveBeenCalledWith('Error verifying JWT', 
            expect.objectContaining({                
                err: expect.any(Error),
            })
        );
    });

    it('should return with UnauthorizedError when token is expired', () => {
        const expiredToken = jwt.sign(
            { sub: 'test-user-id', sid: 'test-session-id' },
            jwtConfig.accessSecret,
            { expiresIn: '-1s' }
        );

        const req = {
            headers: {
            authorization: `Bearer ${expiredToken}`
            }
        } as any;

        const res = {} as any;
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(logger.error).toHaveBeenCalledWith('Error verifying JWT', 
            expect.objectContaining({
                err: expect.any(Error),
            })
        );
    });
});