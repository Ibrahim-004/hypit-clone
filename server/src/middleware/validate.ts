import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(
        new ApiError(
          400,
          'VALIDATION_ERROR',
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        ),
      );
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      next(
        new ApiError(
          400,
          'VALIDATION_ERROR',
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        ),
      );
      return;
    }
    req.params = parsed.data as Record<string, string>;
    next();
  };
}
