import express from 'express';
import { createApplication } from './create-application';

import { config } from '@/infra/config';
import { createAuthRoutes } from '@/infra/http/routes/auth';
import { getJwtAuthGuardMiddleware } from '@/infra/http/middlewares/jwt-auth-guard';
import { requestContextMiddleware } from '@/infra/http/middlewares/request-context';

export function createServer() {
	const app = express();

	const { useCases, logger } = createApplication();

	const jwsAuthGuard = getJwtAuthGuardMiddleware(logger, config.jws);

	const authRoutes = createAuthRoutes(jwsAuthGuard, useCases.loginUseCase);

	app.use(express.json());
	app.use(requestContextMiddleware);
	app.use('/api/auth', authRoutes);

	return app;
}
