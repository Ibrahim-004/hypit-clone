import request from 'supertest';
import type { Express } from 'express';

export async function registerUser(app: Express, email: string, password = 'password123') {
  const response = await request(app).post('/api/v1/auth/register').send({ email, password });
  if (response.status !== 201)
    throw new Error(`Register failed: ${response.status} ${JSON.stringify(response.body)}`);
  return {
    token: response.body.accessToken as string,
    user: response.body.user as { id: string; email: string },
  };
}
export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}
