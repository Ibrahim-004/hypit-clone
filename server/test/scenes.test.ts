import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createFakeDb, fakeAi } from './fakes';
import { registerUser, auth } from './helpers';

describe('scenes', () => {
  it('replaces scenes in one save and normalizes order', async () => {
    const app = createApp({ db: createFakeDb(), ai: fakeAi([]) });
    const user = await registerUser(app, 's@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set(auth(user.token))
      .send({ title: 'S' });
    const id = created.body.project.id as string;
    const saved = await request(app)
      .put(`/api/v1/projects/${id}/scenes`)
      .set(auth(user.token))
      .send({
        scenes: [
          { order: 5, text: 'Second', duration: 5, visual: 'B', transition: 'fade' },
          { order: 9, text: 'First', duration: 4, visual: 'A', transition: 'cut' },
        ],
      });
    expect(saved.status).toBe(200);
    expect(saved.body.scenes.map((s: { order: number }) => s.order)).toEqual([0, 1]);
    const detail = await request(app).get(`/api/v1/projects/${id}`).set(auth(user.token));
    expect(detail.body.project.scenes).toHaveLength(2);
  });
});
