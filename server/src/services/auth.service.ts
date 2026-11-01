import { ApiError } from '../utils/errors';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken } from './token.service';
import type { Db } from './db';

export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}
export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function toPublic(user: { id: string; email: string; createdAt: Date }): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export async function register(db: Db, email: string, password: string): Promise<AuthResult> {
  const existing = await db.user.findByEmail(email);
  if (existing) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  const passwordHash = await hashPassword(password);
  const user = await db.user.create({ email, passwordHash });
  return {
    user: toPublic(user),
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
}

export async function login(db: Db, email: string, password: string): Promise<AuthResult> {
  const user = await db.user.findByEmail(email);
  if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  return {
    user: toPublic(user),
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
}
