import type { Request, Response } from 'express';
import { login, register } from '../services/auth.service';
import type { Db } from '../services/db';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../services/token.service';
import { env } from '../config/env';
import { unauthorized } from '../utils/errors';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function makeAuthController(db: Db) {
  return {
    async register(req: Request, res: Response): Promise<void> {
      const result = await register(db, req.body.email as string, req.body.password as string);
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.status(201).json({ user: result.user, accessToken: result.accessToken });
    },
    async login(req: Request, res: Response): Promise<void> {
      const result = await login(db, req.body.email as string, req.body.password as string);
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.json({ user: result.user, accessToken: result.accessToken });
    },
    async refresh(req: Request, res: Response): Promise<void> {
      const token = req.cookies?.refreshToken as string | undefined;
      if (!token) throw unauthorized('Missing refresh token');
      let userId: string;
      try {
        userId = verifyRefreshToken(token);
      } catch {
        throw unauthorized('Invalid or expired refresh token');
      }
      res.cookie('refreshToken', signRefreshToken(userId), cookieOptions);
      res.json({ accessToken: signAccessToken(userId) });
    },
    async logout(_req: Request, res: Response): Promise<void> {
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      res.status(204).send();
    },
  };
}
