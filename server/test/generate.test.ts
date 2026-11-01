import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createFakeDb } from './fakes';
import { registerUser, auth } from './helpers';

const valid = [{ order: 0, text: 'Welcome', duration: 5, visual: 'Sunrise', transition: 'fade' }];

describe('generate', () => {
  it('returns validated scenes', async () => {
    const app = createApp({ db: createFakeDb(), ai: { generateRaw: async () => valid } });
    const user = await registerUser(app, 'g@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(user.token))
      .send({ title: 'G' });
    const res = await request(app)
      .post(`/api/v1/projects/${created.body.project.id as string}/generate`)
      .set(auth(user.token))
      .send({ prompt: 'A sunrise ad' });
    expect(res.status).toBe(200);
    expect(res.body.scenes).toEqual(valid);
  });
  it('retries once and then returns a clean error on invalid AI output', async () => {
    let calls = 0;
    const app = createApp({
      db: createFakeDb(),
      ai: {
        generateRaw: async () => {
          calls += 1;
          return [{ order: 0, text: 'Bad', duration: 999, visual: 'x', transition: 'fade' }];
        },
      },
    });
    const user = await registerUser(app, 'g2@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(user.token))
      .send({ title: 'G2' });
    const res = await request(app)
      .post(`/api/v1/projects/${created.body.project.id as string}/generate`)
      .set(auth(user.token))
      .send({ prompt: 'Bad output please' });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('AI_INVALID_OUTPUT');
    expect(calls).toBe(2);
  });
  it('succeeds on retry after a first invalid output', async () => {
    let calls = 0;
    const app = createApp({
      db: createFakeDb(),
      ai: {
        generateRaw: async () => {
          calls += 1;
          return calls === 1 ? [{ bad: true }] : valid;
        },
      },
    });
    const user = await registerUser(app, 'g3@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(user.token))
      .send({ title: 'G3' });
    const res = await request(app)
      .post(`/api/v1/projects/${created.body.project.id as string}/generate`)
      .set(auth(user.token))
      .send({ prompt: 'Try again' });
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });
});
