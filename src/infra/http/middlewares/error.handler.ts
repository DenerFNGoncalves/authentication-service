import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';
import { UnexpectedError } from '../errors/unexpected.error';
import type { Logger } from '@/application/ports/logger';

export function getErrorHandler(logger: Logger) {
	return function (error: Error, req: Request, res: Response, next: NextFunction) {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json(error.toJSON());
		}

		logger.error('Unexpected error occurred', {
			req: `${req.method.toUpperCase()}:${req.path}`,
			query: req.query || undefined,
			body: req.body || undefined,
			params: req.params || undefined,
			err: error
		});

		return res.status(500).json(new UnexpectedError().toJSON());
	};
}
