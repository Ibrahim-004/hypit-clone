# Hypit-style

Turn a prompt into an editable, animated video timeline. Type a description in chat, get a structured scene list from an AI model (server-side only), reorder and edit scenes on a timeline, preview the sequence live, and export the scene JSON.

![Screenshot placeholder](docs/screenshot-placeholder.png)
*Screenshot placeholder: landing page, editor with chat, timeline, and preview.*

## Features

- Chat panel with messages, generating state, and retry on error.
- Timeline with drag reorder (dnd-kit), inline text and duration editing, add and delete, undo and redo, plus up/down buttons as a keyboard alternative to drag.
- Preview player with sequential animated scenes (Framer Motion), play, pause, scrubber, Space to play or pause, and arrow keys to scrub 5 seconds.
- Autosave with a visible Saving / Saved / Failed indicator and rollback to the last saved timeline on save failure.
- Export scene JSON from the editor.
- Authentication with JWT access tokens kept in memory only and refresh tokens in an httpOnly cookie.
- Ownership checks on every project route, so one user cannot read or change another user's project.
- AI output validated against a Zod scene schema, with one retry, before it ever reaches the timeline.

## Architecture overview

```
hypit-clone/
  client/   React 18, Vite, TypeScript (strict), Tailwind CSS, Framer Motion,
            React Router, Zustand (UI state only), TanStack Query (all server data),
            React Hook Form + Zod, dnd-kit, Vitest + React Testing Library, MSW, Playwright
  server/   Node.js, Express, TypeScript (strict), PostgreSQL + Prisma, Zod,
            JWT (access + refresh), bcrypt (cost 12), Pino, Vitest + Supertest,
            Anthropic API (server-side only)
  .github/workflows/ci.yml   lint + typecheck + test + build for client and server
  docker-compose.yml          server app + PostgreSQL
```

Server data lives only in TanStack Query, never copied into Zustand. All client API calls go through one typed client in `client/src/lib/api-client.ts`, and every response is validated with Zod before use. All user and AI text is rendered as plain text. No secrets live in client code; the AI is called only through the backend.

The server is layered: routes are thin wiring, controllers handle HTTP only, and all business logic plus the AI call lives in services. The Prisma data layer is behind a small `Db` interface in `server/src/services/db.ts`, which makes the services testable with an in-memory fake without a database. In production, `server/src/prisma/client.ts` loads the generated Prisma client lazily, after `npm run db:generate`.

## Environment variables

### Server (`server/.env`, see `server/.env.example`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No, defaults to `development` | `development`, `test`, or `production` |
| `PORT` | No, defaults to `4000` | Server port |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes, at least 32 characters | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes, at least 32 characters | Signs 7-day refresh tokens |
| `CLIENT_URL` | No, defaults to `http://localhost:5173` | CORS allowlist, comma-separated |
| `ANTHROPIC_API_KEY` | Yes, for real generation | Anthropic key, server-side only, never committed |
| `ANTHROPIC_MODEL` | No, defaults to `claude-3-5-sonnet-20241022` | Model used for scene generation |

Invalid server environment fails fast at startup. Never commit a real `.env`; only `.env.example` is committed.

### Client (`client/.env`, optional)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL, defaults to `http://localhost:4000/api/v1` |

## Install and run locally

Prerequisites: Node.js 20 or newer, npm, and PostgreSQL (or Docker Compose for the database and server).

```bash
# 1. Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# 2. Configure the server
cp server/.env.example server/.env
# Edit server/.env: set DATABASE_URL, both JWT secrets, and ANTHROPIC_API_KEY.

# 3. Generate the Prisma client and run migrations
cd server
npm run db:generate
npm run db:migrate
cd ..

# 4. Run both parts (two terminals)
npm --prefix server run dev    # http://localhost:4000
npm --prefix client run dev    # http://localhost:5173
```

With Docker Compose (server + PostgreSQL; the client still runs with Vite locally):

```bash
docker compose up --build
# Server on http://localhost:4000, PostgreSQL on localhost:5432.
# Then, in server/.env, run: npm run db:generate && npm run db:migrate
```

## API endpoints

Base URL: `/api/v1`. All non-auth routes require a Bearer access token and ownership of the project.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public, strict rate limit | Create an account |
| `POST` | `/auth/login` | Public, strict rate limit | Log in, access token in body, refresh token in httpOnly cookie |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate the refresh token, return a new access token |
| `POST` | `/auth/logout` | Refresh cookie | Clear the refresh cookie |
| `GET` | `/projects` | JWT | List only the caller's projects |
| `POST` | `/projects` | JWT | Create a project |
| `GET` | `/projects/:id` | JWT + owner | Get a project with its scenes in order |
| `PATCH` | `/projects/:id` | JWT + owner | Rename a project |
| `DELETE` | `/projects/:id` | JWT + owner | Delete a project |
| `POST` | `/projects/:id/generate` | JWT + owner, strict rate limit | Prompt in, validated scene JSON out, not saved yet |
| `PUT` | `/projects/:id/scenes` | JWT + owner | Save the full ordered scene list in one transaction |
| `GET` | `/health` | Public | Liveness check, returns `{ "status": "ok" }` |

Errors always return `{ "error": { "code": "string", "message": "string" } }`, with no stack traces in production and no password hashes or tokens logged or returned. Bodies, queries, and params are validated with strict Zod schemas that reject unknown fields. JSON bodies are limited to 100 KB, prompts to 2,000 characters, scenes to 1–30 seconds each, and at most 50 scenes per project.

## Scripts

```bash
# Client
cd client && npm run dev && npm run lint && npm run typecheck && npm run test && npm run build

# Server
cd server && npm run dev && npm run lint && npm run typecheck && npm run test && npm run build && npm run db:migrate
```

## Tests

- Server (Vitest + Supertest, in-memory fake Db, mocked AI): auth, ownership, validation failures, generate with retry, and scene saving.
- Client (Vitest + React Testing Library + MSW): login form validation and login, chat generation, timeline move, undo, and inline editing.
- Playwright: `client/e2e/happy-path.spec.ts` covers register, create, generate, edit, and save. It needs a running server, PostgreSQL, and a real Anthropic key, so run it separately from unit tests: `cd client && npx playwright test`. The spec is listed by `npx playwright test --list` without browsers installed.

## Roadmap

- Real video rendering and export (MP4) from the scene timeline.
- Voiceover and licensed music tracks per scene.
- Scene thumbnails and generated visuals.
- Project sharing and collaboration.
- Version history for timelines beyond undo and redo.
- More transitions, captions, and aspect ratios (including 9:16).

## License

MIT. See `LICENSE`.
