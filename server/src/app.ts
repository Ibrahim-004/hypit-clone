import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { type Db } from './services/db';
import { getDefaultDb } from './prisma/client';
import { createAiClient, type AiClient } from './services/ai.service';
import { authRouter } from './routes/auth.routes';
import { projectRouter } from './routes/project.routes';
import { healthRouter } from './routes/health.routes';
import { generalLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';

export interface AppDeps {
  db?: Db;
  ai?: AiClient;
}

export function createApp(deps: AppDeps = {}): Express {
  const app = express();
  const db = deps.db ?? getDefaultDb();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL.split(',').map((s) => s.trim()), credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  // Minimal cookie parsing for the refresh-token cookie, without adding a dependency.
  app.use((req, _res, next) => {
    const header = req.headers.cookie;
    const cookies: Record<string, string> = {};
    if (header) {
      for (const part of header.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key) cookies[key] = decodeURIComponent(rest.join('='));
      }
    }
    (req as unknown as { cookies: Record<string, string> }).cookies = cookies;
    next();
  });
  app.use('/api/v1', generalLimiter);
  app.use('/api/v1/health', healthRouter());
  app.use('/api/v1/auth', authRouter(db));
  app.use('/api/v1/projects', projectRouter(db, deps.ai ?? createAiClient()));
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });
  app.use(errorHandler);
  return app;
}
