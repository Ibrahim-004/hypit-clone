import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
export function verifyAccessToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub?: unknown };
  if (typeof payload.sub !== 'string') throw new Error('Invalid token subject');
  return payload.sub;
}
export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub?: unknown };
  if (typeof payload.sub !== 'string') throw new Error('Invalid token subject');
  return payload.sub;
}
