import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createFakeDb, fakeAi } from './fakes';
import { registerUser, auth } from './helpers';

describe('ownership', () => {
  it('prevents another user from reading, editing, deleting, generating, or saving a project', async () => {
    const app = createApp({
      db: createFakeDb(),
      ai: fakeAi([{ order: 0, text: 'Hi', duration: 5, visual: 'Sun', transition: 'fade' }]),
    });
    const owner = await registerUser(app, 'owner@example.com');
    const other = await registerUser(app, 'other@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(owner.token))
      .send({ title: 'Mine' });
    const id = created.body.project.id as string;
    for (const req of [
      request(app).get(`/api/v1/projects/${id}`).set(auth(other.token)),
      request(app).patch(`/api/v1/projects/${id}`).set(auth(other.token)).send({ title: 'Stolen' }),
      request(app).delete(`/api/v1/projects/${id}`).set(auth(other.token)),
      request(app)
        .post(`/api/v1/projects/${id}/generate`)
        .set(auth(other.token))
        .send({ prompt: 'hello' }),
      request(app).put(`/api/v1/projects/${id}/scenes`).set(auth(other.token)).send({ scenes: [] }),
    ]) {
      const res = await req;
      expect(res.status).toBe(404);
    }
    const mine = await request(app).get(`/api/v1/projects/${id}`).set(auth(owner.token));
    expect(mine.status).toBe(200);
  });
});
