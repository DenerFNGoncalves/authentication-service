import type { Request, Response } from 'express';
import { Router } from 'express';
import type { RequestHandlerParams } from 'express-serve-static-core';

export const createAuthRoutes = (authGuard: RequestHandlerParams<any>, controllers: any) => {
	const router = Router();

	const { loginController } = controllers;
	router.post('/login', (req: Request, res: Response) => loginController.handle(req, res));

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
