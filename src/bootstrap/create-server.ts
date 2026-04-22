import express from 'express';
import { createApplication, type ApplicationInstance, type CreateApplicationOverrides } from './create-application';

import { config } from '@/infra/config';
import { createAuthRoutes } from '@/infra/http/routes/auth';
import { getJwtAuthGuardMiddleware } from '@/infra/http/middlewares/jwt-auth-guard';
import { requestContextMiddleware } from '@/infra/http/middlewares/request-context';
import { getErrorHandler } from '@/infra/http/middlewares/error.handler';
import type { RequestHandlerParams } from 'express-serve-static-core';

export type CreateServerOptions = {
	application?: ApplicationInstance;
	applicationOverrides?: CreateApplicationOverrides;
	jwsAuthGuard?: RequestHandlerParams<any>;
};

export function createServer(options: CreateServerOptions = {}) {
	const app = express();

	const { application, applicationOverrides, jwsAuthGuard: jwsAuthGuardOverride } = options;

	const { controllers, logger } = application ?? createApplication(applicationOverrides);

	const jwsAuthGuard = jwsAuthGuardOverride ?? getJwtAuthGuardMiddleware(logger, config.jws);

	const authRoutes = createAuthRoutes(jwsAuthGuard, controllers);

	app.set('trust proxy', true);
	app.use(express.json());
	app.use(requestContextMiddleware);
	app.use('/api/auth', authRoutes);
	app.use(getErrorHandler(logger));

	return app;
}
