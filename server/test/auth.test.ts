import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createFakeDb, fakeAi } from './fakes';
import { registerUser, auth } from './helpers';

describe('auth', () => {
  it('registers, logs in, and rejects a wrong password', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const created = await registerUser(app, 'a@example.com');
    expect(created.token).toBeTruthy();
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@example.com', password: 'password123' });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('a@example.com');
    expect(login.body.user.passwordHash).toBeUndefined();
    const wrong = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@example.com', password: 'wrong-password' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    void auth;
  });
  it('rejects a duplicate email', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    await registerUser(app, 'dup@example.com');
    const second = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });
    expect(second.status).toBe(409);
  });
  it('refreshes and logs out', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const agent = request.agent(app);
    const register = await agent
      .post('/api/v1/auth/register')
      .send({ email: 'refresh@example.com', password: 'password123' });
    expect(register.status).toBe(201);
    const refreshed = await agent.post('/api/v1/auth/refresh').send();
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeTruthy();
    const logout = await agent.post('/api/v1/auth/logout').send();
    expect(logout.status).toBe(204);
  });
});
