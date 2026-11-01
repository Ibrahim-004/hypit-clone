import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createFakeDb, fakeAi } from './fakes';
import { registerUser, auth } from './helpers';

describe('validation', () => {
  it('rejects bad email, unknown fields, and unauthenticated access', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const badEmail = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(badEmail.status).toBe(400);
    expect(badEmail.body.error.code).toBe('VALIDATION_ERROR');
    const unknown = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'ok@example.com', password: 'password123', admin: true });
    expect(unknown.status).toBe(400);
    const unauth = await request(app).get('/api/v1/projects');
    expect(unauth.status).toBe(401);
  });
  it('rejects an over-long prompt and an invalid scene duration', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const user = await registerUser(app, 'v@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(user.token))
      .send({ title: 'V' });
    const id = created.body.project.id as string;
    const longPrompt = await request(app)
      .post(`/api/v1/projects/${id}/generate`)
      .set(auth(user.token))
      .send({ prompt: 'x'.repeat(2001) });
    expect(longPrompt.status).toBe(400);
    const badScene = await request(app)
      .put(`/api/v1/projects/${id}/scenes`)
      .set(auth(user.token))
      .send({
        scenes: [{ order: 0, text: 'Hi', duration: 99, visual: 'Sun', transition: 'fade' }],
      });
    expect(badScene.status).toBe(400);
  });
  it('returns health ok', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
