import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  logger.error({ err: error }, 'Unhandled error');
  if (env.NODE_ENV === 'production') {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
  } else {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
}
