import express from 'express';
import { createApplication } from './create-application';

import { config } from '@/infra/config';
import { createAuthRoutes } from '@/infra/http/routes/auth';
import { getJwtAuthGuardMiddleware } from '@/infra/http/middlewares/jwt-auth-guard';
import { requestContextMiddleware } from '@/infra/http/middlewares/request-context';
import { getErrorHandler } from '@/infra/http/middlewares/error.handler';

export function createServer() {
	const app = express();

	const { controllers, logger } = createApplication();

	const jwsAuthGuard = getJwtAuthGuardMiddleware(logger, config.jws);

	const authRoutes = createAuthRoutes(jwsAuthGuard, controllers);

	app.use(express.json());
	app.use(requestContextMiddleware);
	app.use('/api/auth', authRoutes);
	app.use(getErrorHandler(logger));

	return app;
}
