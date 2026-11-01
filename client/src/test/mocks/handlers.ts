import { http, HttpResponse } from 'msw';

const api = 'http://localhost:4000/api/v1';

export const handlers = [
  http.post(`${api}/auth/login`, async () =>
    HttpResponse.json({
      user: { id: 'user-1', email: 'test@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
      accessToken: 'test-access-token',
    }),
  ),
  http.post(`${api}/auth/register`, async () =>
    HttpResponse.json(
      {
        user: { id: 'user-1', email: 'test@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
        accessToken: 'test-access-token',
      },
      { status: 201 },
    ),
  ),
  http.get(`${api}/projects`, async () => HttpResponse.json({ projects: [] })),
  http.post(`${api}/projects/:id/generate`, async () =>
    HttpResponse.json({
      scenes: [
        {
          order: 0,
          text: 'Welcome to the cafe',
          duration: 5,
          visual: 'Sunlit cafe',
          transition: 'fade',
        },
        {
          order: 1,
          text: 'Fresh coffee served',
          duration: 5,
          visual: 'Coffee cup close-up',
          transition: 'cut',
        },
      ],
    }),
  ),
];
