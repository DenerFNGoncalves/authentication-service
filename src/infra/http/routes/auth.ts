import type { Request, Response } from 'express';
import type { LoginUseCase } from '@/application/use-cases/login';
import { Router } from 'express';
import type { RequestHandlerParams } from 'express-serve-static-core';

export const createAuthRoutes = (authGuard: RequestHandlerParams<any>, service: LoginUseCase) => {
    const router = Router();    
    
    router.post('/login', async (req: Request, res: Response) => {
        const result = await service.execute(req.body);
        res.json(result);
    });

    router.post('/logout', authGuard, async (req: Request, res: Response) => {
        // logout logic to be implemented
        // const result = await service.logout(req.body);
        // res.json(result);
        res.status(501).send('Not implemented');
    });

    router.post('/refresh-token', async (req: Request, res: Response) => {
        // token refresh logic to be implemented
        // const result = await service.refreshToken(req.body);
        // res.json(result);
        res.status(501).send('Not implemented');
    });

    return router;
};