import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../utils/errors';
import { verifyAccessToken } from '../services/token.service';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(unauthorized('Missing or invalid authorization header'));
    return;
  }
  try {
    req.userId = verifyAccessToken(header.slice('Bearer '.length));
    next();
  } catch {
    next(unauthorized('Invalid or expired access token'));
  }
}
